import React from 'react';
import './App.css';
import DisplayPosts from './components/DisplayPosts/DisplayPosts';
import CreatePost from './components/CreatePost/CreatePost';
import { withAuthenticator } from 'aws-amplify-react';

function App() {
  return (
    <div className="App">
      <CreatePost />
      <DisplayPosts />
    </div>
  );
}

export default withAuthenticator( App, { includeGreetings: true } );
