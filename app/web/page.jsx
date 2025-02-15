'use client'
import React, { Component } from 'react';
import './style.css';
import WebRoutes from './WebRouter';
import WebHeader from './webheader';
import WebFooter from './webfooter';
import { withTranslation } from "react-i18next";

class Web extends Component {
  state = {}
  render () {
    let webheaderComponent = !this.state.isFullPageLayout ? <WebHeader /> : '';
    let webfooterComponent = !this.state.isFullPageLayout ? <WebFooter/> : '';
    return (
      <div className="bg-white">
        { webheaderComponent }
          <WebRoutes/>
        { webfooterComponent }
      </div>
    );
  }
}
export default withTranslation()((Web));