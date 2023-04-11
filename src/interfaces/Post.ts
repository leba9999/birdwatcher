import {User} from './User';
import {Types, Document} from 'mongoose';
import {Point} from 'geojson';
import { Bird } from "./Bird";

interface Post extends Document {
    title: string;
    description: string;
    user: Types.ObjectId | User;
    createdAt: Date;
    spottedAt: Date;
    location: Point;
    bird: Bird;
    filename: string;
}

export { Post };