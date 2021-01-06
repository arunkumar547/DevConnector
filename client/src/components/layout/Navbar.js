import React, { Fragment } from 'react'
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {logout} from '../../actions/auth'
 
const Navbar = ({auth:{isAuthenticated,loading} , logout}) => {

const authLinks=(
  <ul>
          <li>
            <Link to="/" onClick={logout}><i className="fas fa-sign-out-alt"></i>{' '}Logout</Link>
          </li>
        </ul>
)

const guestLinks=(
  <ul>
          <li>
            <Link to="profiles.html">Developers</Link>
          </li>
          <li>
            <Link to="/register">Register</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </ul>
)

    return (
      <nav className="navbar bg-dark">
        <h1>
          <Link to="index.html">
            <i className="fas fa-code"></i> DevConnector
          </Link>
        </h1>
        {!loading && (<Fragment>{isAuthenticated ? authLinks : guestLinks}</Fragment>)}
      </nav>
    );
}

Navbar.prototype={
  auth:PropTypes.array.isRequired,
}

const mapStateTOProps= state=>({
  auth : state.auth
})

export default connect(mapStateTOProps,{logout})(Navbar)
