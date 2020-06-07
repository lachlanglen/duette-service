import React from 'react';
import { connect } from 'react-redux';
import NewUserModal from './NewUserModal';

const NewUserSignup = (props) => {

  console.log('props.user in NewUserSignup: ', props.user)

  return (
    <NewUserModal />
  )
};

const mapState = ({ user }) => {
  return {
    user,
  }
}
export default connect(mapState)(NewUserSignup);
