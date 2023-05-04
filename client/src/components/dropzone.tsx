import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import classes from './dropzone.module.css';

type Props = {
  onFileUpload: (file: File) => void;
};

const Dropzone: React.FC<Props> = ({ onFileUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    onFileUpload(file);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': []
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`${classes.dropzone} ${isDragActive ? `${classes.active}` : ''}`}
    >
      <input type='image' {...getInputProps()} />
      {isDragActive ? (
        <p className={classes.text}>Drop the file here</p>
      ) : (
        <p className={classes.text}>Drag and drop a file here, or click to select a file</p>
      )}
    </div>
    
  );
};

export default Dropzone;