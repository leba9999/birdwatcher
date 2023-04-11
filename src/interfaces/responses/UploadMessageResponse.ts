import {Point} from 'geojson';

export default interface UploadMessageResponse {
  message: string;
  data: {
    filename: string;
    location: Point;
  };
}
