import React from 'react'
import Spinner from "react-bootstrap/Spinner";


const PageLayout = ({ spinner, permissions, children }) => {
  return (
    <div className='w-full h-screen'>
      {permissions && !spinner ? (
        children
      ) : spinner ? (
        <Spinner
          animation="grow"
          style={{ left: "55%", bottom: "50%", position: "fixed" }}
        />
      ) : (
        <>
          <h1 className="text-center mt-5 pt-5">Permission Denied!</h1>
          <p className="text-center mt-3">
            Sorry!, You don't have permission to access this module.
          </p>
        </>
      )}
    </div>
  )
}

export default PageLayout