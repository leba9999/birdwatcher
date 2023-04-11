import { Types, Document } from 'mongoose';
import { User } from "./User";
import { Point } from 'geojson';
import { Species } from "./Species";

interface Bird extends Document {
    bird_name: string;
    species: Types.ObjectId | Species;
    user: Types.ObjectId | User;
    filename: string;
    spotted_at: Date;
    location: Point;
}

export { Bird };