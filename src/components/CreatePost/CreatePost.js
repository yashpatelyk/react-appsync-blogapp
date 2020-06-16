import React, { Component } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { createPost } from '../../graphql/mutations';

export default class CreatePost extends Component {
  state = {
    postOwnerId: '',
    postOwnerUsername: '',
    postTitle: '',
    postBody: ''
  }

  componentDidMount = async () => {
    const user = await Auth.currentUserInfo();
    this.setState( {
      postOwnerId: user.attributes.sub,
      postOwnerUsername: user.username,
    } )
  }

  addPost = async () => {
    const input = {
      postOwnerId: this.state.postOwnerId,
      postOwnerUsername: this.state.postOwnerUsername,
      postTitle: this.state.postTitle,
      postBody: this.state.postBody,
      createdAt: new Date().toISOString()
    }

    await API.graphql( graphqlOperation(
      createPost,
      { input }
    ) );

    this.setState({
      postTitle: '',
      postBody: ''
    })
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  render() {
    return (
      <form>
        <div>
          <input 
            placeholder="title"
            name="postTitle"
            value={this.state.postTitle}
            onChange={this.handleChange}
          />
        </div>
        <div>
          <textarea 
            placeholder="body"
            name="postBody"
            value={this.state.postBody}
            onChange={this.handleChange}
          />
        </div>
        <button onClick={this.addPost} type="button">
          Submit
        </button>
      </form>
    );
  }
}