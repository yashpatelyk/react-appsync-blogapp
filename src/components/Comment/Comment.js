import React from 'react';

const Comment = ( props ) => {
  return (
    <div>
      <span>Comment by: { props.commentOwnerUsername } On { props.createdAt }</span>
      <div>{ props.content }</div>
    </div>
  )
}

export default Comment