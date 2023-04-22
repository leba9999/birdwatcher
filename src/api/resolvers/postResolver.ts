import { Post } from '../../interfaces/Post';
import { TokenUser } from '../../interfaces/User';
import postModel from '../models/postModel';
import {GraphQLError} from 'graphql';

export default {
    Query: {
        posts: async () => {
            return await postModel.find();
        },
        postById: async (_parent: undefined, args: { id: string }) => {
            return await postModel.findById(args.id);
        },
        postByOwner: async (_parent: undefined, args: { id: string }) => {
            return await postModel.find({owner: args.id});
        }
    },
    Mutation: {
        createPost: async (_parent: undefined, args: Post, user: TokenUser) => {
            try{
                if(!user.token) {
                    throw new GraphQLError('Not authorized',{
                        extensions: {code: 'NOT_AUTHORIZED'},
                    });
                }
                const post = await postModel.create(args);
                const savedPost = await post.save();
                return savedPost;
            }catch(err){
                console.log(err);
            }
        },
        updatePost: async (_parent: undefined, args: Post, user: TokenUser) => {
            const post = await postModel.findByIdAndUpdate(args.id, args);
            if(!post){
                return;
            }
            if(!user.token || post.owner._id.toString() !== user.id) {
                throw new GraphQLError('Not authorized',{
                    extensions: {code: 'NOT_AUTHORIZED'},
                });
            }
            return await postModel.findByIdAndUpdate(args.id, args, {new: true});
        },
        deletePost: async (_parent: undefined, args: { id: string }, user: TokenUser) => {
            const post = await postModel.findById(args.id);
            if(!post){
                return;
            }
            if(!user.token || post.owner._id.toString() !== user.id) {
                throw new GraphQLError('Not authorized',{
                    extensions: {code: 'NOT_AUTHORIZED'},
                });
            }
            return await postModel.findByIdAndDelete(args.id);
        },
        updatePostAsAdmin: async (_parent: undefined, args: Post, user: TokenUser) => {
            if(!user.token || user.role !== 'admin') {
                throw new GraphQLError('Not authorized',{
                    extensions: {code: 'NOT_AUTHORIZED'},
                });
            }
            return await postModel.findByIdAndUpdate(args.id, args, {new: true});
        },
        deletePostAsAdmin: async (_parent: undefined, args: { id: string }, user: TokenUser) => {
            if(!user.token || user.role !== 'admin') {
                throw new GraphQLError('Not authorized',{
                    extensions: {code: 'NOT_AUTHORIZED'},
                });
            }
            return await postModel.findByIdAndDelete(args.id);
        }
    }
}