import Link from 'next/link';
import React, { Component } from 'react';

class Footer extends Component {
  render () {
    return (
      <footer className="footer text-sm">
        <div className="container-fluid">
          <div className="justify-content-center justify-content-sm-between py-2 w-100 text-center">
            <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">
              Copyright © <Link className='hover:text-green-500 text-green-500' href="https://ohana.africa/" target="_blank" rel="noopener noreferrer">ohana.africa </Link>{new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;