import { PostsDatabase } from "../database/PostDatabase"
import { CreatePostInputDTO, EditPostInputDTO, PostDTO } from "../dto/PostDTO"
import { BadRequestError } from "../error/BadRequestError"
import { NotFoundError } from "../error/NotFoundError"
import { Post } from "../models/Post"
import { TPostsDB } from "../types"

export class PostBusiness {
    constructor(
        private postsDatabase: PostsDatabase
    ) { }

    public getPosts = async (q: string | undefined) => {

        const postsDatabase = new PostsDatabase()
        const postsDB: TPostsDB[] = await postsDatabase.findPosts(q)

        const posts: Post[] = postsDB.map((postDB) => new Post(
            postDB.id,
            postDB.creator_id,
            postDB.content,
            postDB.likes,
            postDB.dislikes,
            postDB.created_at,
            postDB.updated_at
        ))

       

        return posts
    }

    public createPost = async (input: CreatePostInputDTO) => {

        const { id, creatorId, content } = input


        const postDBExist = await this.postsDatabase.findPostById(id)

        if (postDBExist) {
            throw new BadRequestError("'id' já existe")
        }

        let newLikes = 0
        let newDislikes = 0

      
        const newPost = new Post(
            id,
            creatorId,
            content,
            newLikes,
            newDislikes,
            new Date().toISOString(),
            new Date().toISOString()
        )

      
        const newPostDB: TPostsDB = {
            id: newPost.getIdPost(),
            creator_id: newPost.getCreatorIdPost(),
            content: newPost.getContentPost(),
            likes: newPost.getLikesPost(),
            dislikes: newPost.getDislikesPost(),
            created_at: newPost.getCreatedAtPost(),
            updated_at: newPost.getUpdatedAtPost()
        }

        await this.postsDatabase.insertPost(newPostDB)

        const postDTO = new PostDTO()
        const output = postDTO.createPostOutput(newPost)

        return output
    }

    public editPost = async (input: EditPostInputDTO) => {

        const { idToEdit, content } = input

        const postsDB = await this.postsDatabase.findPostById(idToEdit)

        if (!postsDB) {

            throw new NotFoundError("'id' não encontrado")
        }

        if (postsDB) {
            const newPost = new Post(
                idToEdit,
                postsDB.creator_id,
                content,
                postsDB.likes,
                postsDB.dislikes,
                postsDB.created_at,
                new Date().toISOString()
            )

            const newPostDB: TPostsDB = {
                id: newPost.getIdPost(),
                creator_id: newPost.getCreatorIdPost(),
                content: newPost.getContentPost(),
                likes: newPost.getLikesPost(),
                dislikes: newPost.getDislikesPost(),
                created_at: newPost.getCreatedAtPost(),
                updated_at: newPost.getUpdatedAtPost()
            }

            newPost.setContentPost(newPostDB.content)

            await this.postsDatabase.updatePostById(newPostDB)

            const postDTO = new PostDTO()
            const output = postDTO.editPostOutput(newPost)

            return output
        }

    }

    public deletePost = async (id: string) => {

        const postExist = await this.postsDatabase.findPostById(id)

        if (!postExist) {

            throw new NotFoundError("Id não encontrado")
        }
        
        await this.postsDatabase.deletePost(id)

        return ({
            message: "Post deletado com sucesso"
        })

    }

}