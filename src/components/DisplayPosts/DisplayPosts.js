import React, { Component } from 'react';
import { listPosts } from '../../graphql/queries';
import { deletePost } from '../../graphql/mutations';
import { onCreatePost, onDeletePost, onCreateComment } from '../../graphql/subscriptions';
import { API, graphqlOperation } from 'aws-amplify';

import './DisplayPosts.css';

import DeletePost from '../DeletePost/DeletePost'
import EditPost from '../EditPost/EditPost';
import CreateComment from '../CreateComment/CreateComment';
import Comment from '../Comment/Comment';

export default class DisplayPosts extends Component {
  state = {
    posts: []
  };
  createPostSubscription;
  deletePostSubscription;
  createCommentSubscription;

  componentDidMount = async () => {
    this.getPosts();

    this.createPostSubscription = API.graphql(graphqlOperation( onCreatePost )).subscribe( postData => {
      const post = postData.value.data.onCreatePost;
      const prevPosts = this.state.posts;
      this.setState({
        posts: [post, ...prevPosts],
      });
    } );
    this.deletePostSubscription = API.graphql(graphqlOperation( onDeletePost )).subscribe( postData => {
      const post = postData.value.data.onDeletePost;
      this.setState({
        posts: this.state.posts.filter(prev => prev.id !== post.id),
      });
    } );
    this.createCommentSubscription = API.graphql( graphqlOperation( onCreateComment ) ).subscribe( commentData => {
      const comment = commentData.value.data.onCreateComment;
      const posts = [...this.state.posts];
      const matchingPost = posts.find( post => post.id === comment.post.id );
      if ( matchingPost ) {
        matchingPost.comments.items.push( comment );
        this.setState({ posts });
      }
    } );

  }

  componentWillUnmount() {
    this.createPostSubscription.unsubscribe();
    this.deletePostSubscription.unsubscribe();
    this.createCommentSubscription.unsubscribe();
  }

  getPosts = async () => {
    const posts = await API.graphql( graphqlOperation( listPosts, {
      limit: 10
    } ) );
    this.setState({
      posts: posts.data.listPosts.items
    })
  }

  render() {
    const { posts } = this.state;
    return (
      posts.map( post => ( 
        <div className="post" key={post.id}>
          <h1>{ post.postTitle }</h1>
          <span>
            { "Wrote by: " } { post.postOwnerUsername }
            <br />
            { "on" }
            <br />
            <time>
              { new Date(post.createdAt).toLocaleDateString() }
            </time>
          </span>
          <p>{ post.postBody }</p>
          <EditPost />
          <DeletePost id={ post.id }/>
          <CreateComment postId={ post.id }/>
          { post.comments.items.map( comment => (
            <Comment {...comment} key={comment.id}/>
           ) ) }
        </div>
       ) )
    )
  }
}