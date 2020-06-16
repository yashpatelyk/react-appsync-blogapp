import React, { Component } from 'react';
import { listPosts } from '../../graphql/queries';
import { onCreatePost, onDeletePost, onCreateComment, onCreateLike } from '../../graphql/subscriptions';
import { API, graphqlOperation, Auth } from 'aws-amplify';

import './DisplayPosts.css';

import DeletePost from '../DeletePost/DeletePost'
import EditPost from '../EditPost/EditPost';
import CreateComment from '../CreateComment/CreateComment';
import Comment from '../Comment/Comment';
import { createLike } from '../../graphql/mutations';

export default class DisplayPosts extends Component {
  state = {
    posts: [],
    ownerUserName: '',
    ownerUserId: '',
    errorMessage: '',
  };
  createPostSubscription;
  deletePostSubscription;
  createCommentSubscription;

  componentDidMount = async () => {
    this.getPosts();

    await Auth.currentUserInfo().then( userInfo => {
      this.setState({
        ownerUserId: userInfo.attributes.sub,
        ownerUserName: userInfo.username,
      });
    } );

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
    this.createLikeSubscription = API.graphql( graphqlOperation( onCreateLike ) ).subscribe( likeData => {
      const like = likeData.value.data.onCreateLike;
      const posts = [...this.state.posts];
      const matchingPost = posts.find( post => post.id === like.post.id );
      if ( matchingPost ) {
        matchingPost.likes.items.push( like );
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

  handleLike = async ( post ) => {
    if ( post.postOwnerId === this.state.ownerUserId ) {
       this.setState({
         errorMessage: "Can not like your own post"
       })
    } else if ( this.hasLikedPost( post ) ) {
      this.setState({
        errorMessage: "You have already liked this post"
      })
    } else {
      const input = {
        numberLikes: 1,
        likeOwnerId: this.state.ownerUserId,
        likeOwnerUsername: this.state.ownerUserName,
        likePostId: post.id,
      }
      await API.graphql( graphqlOperation( createLike, { input } ) );
    }
    
  }

  hasLikedPost = ( post ) => {
    return post.likes.items.find( like => {
      return like.likeOwnerId === this.state.ownerUserId;
    } )
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
          <button
            onClick={this.handleLike.bind( this, post )}
          >
            Like
          </button>
          { this.state.errorMessage }
          <p>{ post.likes.items.length }</p>
          { post.postOwnerId === this.state.ownerUserId ? <EditPost /> : '' }
          { post.postOwnerId === this.state.ownerUserId ? <DeletePost id={ post.id }/> : '' }
          <CreateComment postId={ post.id }/>
          { post.comments.items.map( comment => (
            <Comment {...comment} key={comment.id}/>
           ) ) }
        </div>
       ) )
    )
  }
}