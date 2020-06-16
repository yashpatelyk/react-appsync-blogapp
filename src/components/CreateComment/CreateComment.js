import React from 'react';
import { createComment } from '../../graphql/mutations';
import { Auth, API, graphqlOperation } from 'aws-amplify';

export default class CreateComment extends React.Component {
  state = {
    content: ''
  };

  handleCommentChange = ( event ) => {
    this.setState({
      content: event.target.value,
    });
  }

  handleCommentAdd = async () => {
    const userInfo = await Auth.currentUserInfo();
    const input = {
      commentOwnerId: userInfo.attributes.sub,
      commentOwnerUsername: userInfo.username,
      content: this.state.content,
      createdAt: new Date().toISOString(),
      commentPostId: this.props.postId,
    };
    await API.graphql( graphqlOperation( createComment, { input } ) );
    this.setState({ content: '' });
  }

  render() {
    return (
      <form>
        <input 
          name="content"
          placeholder="Add comment"
          onChange={this.handleCommentChange}
          value={this.state.content}
        />
        <button type='button' onClick={this.handleCommentAdd}>
          Add Comment
        </button>
      </form>
    )
  }
}