import React from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { deletePost } from '../../graphql/mutations';

const handleDelete = async ( id ) => {
    await API.graphql( graphqlOperation( deletePost, {
      input : {
       id, 
      }
    } ) );
}

const DeletePost = (props) => (
  <button onClick={() => handleDelete( props.id )}>Delete</button>
)

export default DeletePost;