import { Document } from 'mongoose';

interface Bird extends Document {
    birdname: string;
    description: string;
}

export { Bird };