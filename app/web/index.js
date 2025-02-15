import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
export function WebSite() {
    const [lgShow, setLgShow] = useState(false);
    const [lgShow1, setLgShow1] = useState(false);
    const [lgShow3, setLgShow3] = useState(false);
    return (
        <>
            <div className='container my-5'>
                <div className='row'>
                    <div className='col-lg-8 col-md-6 mt-5' id='backg'>
                        <div className='mt-4'>
                            <h1 className='font-weight-bold pt-3 text-black' style={{ fontSize: "5rem" }}>Fintech for Groups</h1>
                            <h3 className='mt-3'>To Pool and Manage Money in Group</h3>
                            <h3>Full Transparency, Free & Totally Secure!</h3>
                            <button className="btn btn-warning logo bg-warning mt-5 mr-4 mb-2 py-3 px-4 rounded" type="submit" onClick={() => setLgShow(true)}>Get Started</button>
                            <button className="btn btn-warning playstr bg-warning mt-5 mr-4 mb-2 py-3 px-4 rounded" type="submit" onClick={() => setLgShow3(true)}>Get Started</button>
                            <button className="btn btn-warning bg-warning mt-5 mb-2 py-3 px-4 rounded" type="submit" onClick={() => setLgShow1(true)}>Watch a Video</button>
                        </div>
                    </div>
                    <div className='col-lg-4 col-md-6'>
                        <div className='text-center'>
                            <img className='mt-4' src={("../../public/assets/images/webimage/Phone.png")}></img>
                        </div>
                        <div className='text-center mt-4'>
                            <img className='mr-2 logo' width={'150px'} src={("../../public/assets/images/webimage/google-play-logo1.png")} onClick={() => setLgShow(true)} style={{cursor:"pointer" }}></img>
                            <a href='https://play.google.com/store/apps/details?id=com.ohana.africa&hl=en&gl=US'> <img className='playstr mr-2 text-center' width={'150px'} src={("../../public/assets/images/webimage/google-play-logo1.png")}></img></a>
                        </div>
                    </div>
                </div>
                <Modal
                    size="lg"
                    show={lgShow1}
                    onHide={() => setLgShow1(false)}
                    aria-labelledby="example-modal-sizes-title-lg"
                    style={{ paddingleft: 'none !important' }}
                >
                    <iframe width="100%" height="506" src="https://www.youtube.com/embed/vRClbTsn5r0" title="Ohana, Fintech for Groups" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </Modal>
                <Modal
                    size="lg"
                    show={lgShow3}
                    onHide={() => setLgShow3(false)}
                    aria-labelledby="example-modal-sizes-title-vcenter"
                    centered
                >
                    <Modal.Header className='' style={{ backgroundColor: "#FFBB22" }} closeButton>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: "#FFBB22" }}>
                         <div>
                            <h1 className='text-white font-weight-bold text-center'>Ready To GO ?</h1>
                            <h4 className='text-black font-weight-bold text-center'>Join Ohana Today!</h4>
                            <div className='text-center mt-5'>
                                  <a href='https://play.google.com/store/apps/details?id=com.ohana.africa&hl=en&gl=US'> <img className='playstr mr-2 text-center' width={'150px'} src={("../../public/assets/images/webimage/google-play-logo1.png")}></img></a>
                            </div>
                         </div>
                    </Modal.Body>
                </Modal>
                <Modal
                    size="lg"
                    show={lgShow}
                    onHide={() => setLgShow(false)}
                    aria-labelledby="example-modal-sizes-title-vcenter"
                    centered
                >
                    <Modal.Header className='' style={{ backgroundColor: "#FFBB22" }} closeButton>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: "#FFBB22" }}>
                        <div className=''>
                            <img className='w-100' src={("../../public/assets/images/webimage/modal.jpeg")}></img>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
            <img className='hand' src={("../../public/assets/images/webimage/image 1.png")}></img>
            <div className='bg-warning w-100'>
                <div className='container'>
                    <h1 className='text-light text-center pt-5' style={{ fontSize: "4rem" }}>Ready To Go?</h1>
                    <h1 className='text-center'>Join Ohana Today!</h1>
                    <div className=''>
                        <img className='w-100' src={("../../public/assets/images/webimage/2B 1.png")}></img>
                    </div>
                    <div className='row mt-5'>
                        <div className='col-lg-6 col-md-12 col-sm-3'>
                            <h1 className='text-light' style={{ fontSize: "4rem" }}>Fintech for Groups.</h1>
                            <h4>Making communities, families and friends bonds stronger with Group Money Pooling</h4>
                        </div>
                    </div>
                </div>
                <img className='arrowup' style={{ marginTop: "-9rem" }} src={("../../public/assets/images/webimage/Sketch.png")}></img>
            </div>
            <div className='container mt-5'>
                <h1 className='text-center font-weight-bold text-black' style={{ fontSize: "3rem" }}>How it works</h1>
                <div className='row mt-5'>
                    <div className='col-lg-4 col-md-4 col-sm-3'>
                        <img className='' height={'50%'} src={("../../public/assets/images/webimage/1.png")}></img>
                    </div>
                    <div className='col-lg-4 col-md-4 col-sm-3'>
                        <div className='text-center'>
                            <img className='mt-5 w-100 arrowbt' src={("../../public/assets/images/webimage/Vectorarrow.png")}></img>
                        </div>
                    </div>
                    <div className='col-lg-4 col-md-4 col-sm-3'>
                        <img className='mt-5 float-right' height={'50%'} src={("../../public/assets/images/webimage/2.png")}></img>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-lg-4 col-md-4 col-sm-3'>
                        <img className='' height={'50%'} src={("../../public/assets/images/webimage/3.png")}></img>
                    </div>
                    <div className='col-lg-4 col-md-4 col-sm-3'>
                        <div className='text-center'>
                            <img className='mt-5 w-100 arrowbt' src={("../../public/assets/images/webimage/Vectorarrow.png")}></img>
                        </div>
                    </div>
                    <div className='col-lg-4 col-md-4 col-sm-3'>
                        <img className='mt-5 float-right' height={'50%'} src={("../../public/assets/images/webimage/4.png")}></img>
                    </div>
                </div>
            </div>
            <div className='container'>
                <div className='' style={{ marginBottom: "9rem" }}>
                    <h1 className='text-center font-weight-bold text-black' style={{ fontSize: "3rem" }}>What are they using Ohana for</h1>
                </div>
                <div className='row mt-5 disp'>
                    <div className='col grid-margin-xl-0 grid-margin spaceup spaceup'>
                        <div className='card h-100 bg-warning'>
                            <div className='card-body'>
                                <div className="text-center mb-2">
                                    <img className='imgicon' src={("../../public/assets/images/webimage/church 1.png")}></img>
                                    <h6 className='font-weight-semibold text-light mt-4'>Churches</h6>
                                    <span>Collect contributions and donations</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col grid-margin-xl-0 grid-margin spaceup'>
                        <div className='card h-100 bg-warning'>
                            <div className='card-body'>
                                <div className="text-center mb-2">
                                    <img className='imgicon' src={("../../public/assets/images/webimage/family 1.png")}></img>
                                    <h6 className='font-weight-semibold text-light mt-4'>Families</h6>
                                    <span>Family solidarity fund & Special fund collection: health care, weddings, etc.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col grid-margin-xl-0 grid-margin spaceup'>
                        <div className='card h-100 bg-warning'>
                            <div className='card-body'>
                                <div className="text-center mb-2">
                                    <img className='imgicon' src={("../../public/assets/images/webimage/funeral 1.png")}></img>
                                    <h6 className='font-weight-semibold text-light mt-4'>Funerals</h6>
                                    <span>Family fund collection for funeral ceremonies, and donations collection.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col grid-margin-xl-0 grid-margin spaceup'>
                        <div className='card h-100 bg-warning'>
                            <div className='card-body'>
                                <div className="text-center mb-2">
                                    <img className='imgicon' src={("../../public/assets/images/webimage/social-care 1.png")}></img>
                                    <h6 className='font-weight-semibold text-light mt-4'>Entrepreneurship</h6>
                                    <span>Pooling money together for a project</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col grid-margin-xl-0 grid-margin spaceup'>
                        <div className='card h-100 bg-warning'>
                            <div className='card-body'>
                                <div className="text-center mb-2">
                                    <img className='imgicon' src={("../../public/assets/images/webimage/support 1.png")}></img>
                                    <h6 className='font-weight-semibold text-light mt-4'> Saving and credit Groups</h6>
                                    <span>Group of friends pooling money together and use it for whatever good they want</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row disp' style={{ marginTop: "5rem" }}>
                    <div className='col grid-margin-xl-0 grid-margin spaceup'>
                        <div className='card h-100 bg-warning'>
                            <div className='card-body'>
                                <div className="text-center mb-2">
                                    <img className='imgicon' src={("../../public/assets/images/webimage/save-money 1.png")}></img>
                                    <h6 className='font-weight-semibold text-light mt-4'>Saving Duo</h6>
                                    <span>A couple pooling money for wedding, new house, big vacation, etc.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col grid-margin-xl-0 grid-margin spaceup'>
                        <div className='card h-100 bg-warning'>
                            <div className='card-body'>
                                <div className="text-center mb-2">
                                    <img className='imgicon' src={("../../public/assets/images/webimage/workspace 1.png")}></img>
                                    <h6 className='font-weight-semibold text-light mt-4'>Office</h6>
                                    <span>Colleagues pooling money together strengthening office solidarity.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col grid-margin-xl-0 grid-margin spaceup'>
                        <div className='card h-100 bg-warning'>
                            <div className='card-body'>
                                <div className="text-center mb-2">
                                    <img className='imgicon' src={("../../public/assets/images/webimage/saving 1.png")}></img>
                                    <h6 className='font-weight-semibold text-light mt-4'>Peers Fund</h6>
                                    <span>Teachers, Students, Apprentices pooling money for celebrations, solidarity</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col grid-margin-xl-0 grid-margin spaceup'>
                        <div className='card h-100 bg-warning'>
                            <div className='card-body'>
                                <div className="text-center mb-2">
                                    <img className='imgicon' src={("../../public/assets/images/webimage/donation 1.png")}></img>
                                    <h6 className='font-weight-semibold text-light mt-4'>Solidarity Fund</h6>
                                    <span>Voluntary contribution to fund selected causes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col grid-margin-xl-0 grid-margin spaceup'>
                        <div className='card h-100 bg-warning'>
                            <div className='card-body'>
                                <div className="text-center mb-2">
                                    <img className='imgicon' src={("../../public/assets/images/webimage/fund 1.png")}></img>
                                    <h6 className='font-weight-semibold text-light mt-4'>Investment Clubs</h6>
                                    <span>Group of investors putting money together to invest</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='container mt-5'>
                <div className='row'>
                    <div className='col-lg-4 col-md-6 col-sm-3'>
                        <div className='text-center'>
                            <img className='' src={("../../public/assets/images/webimage/Phone mockup.png")}></img>
                        </div>
                    </div>
                    <div className='col-lg-8 col-md-6 col-sm-3'>
                        <h1 className='font-weight-bold text-center mt-5 text-black' style={{ fontSize: "3rem" }}>We’re serious about security.</h1>
                        <div className='row mt-5'>
                            <div className='col-lg-6'>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="icon-holder text-dark py-1 px-2 rounded mr-2">
                                        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="23" cy="23" r="23" fill="#FFBB22" />
                                            <path d="M28.8949 15.2716C28.6481 15.134 28.3767 15.0466 28.0962 15.0142C27.8156 14.9818 27.5315 15.0051 27.2599 15.0828C26.9884 15.1605 26.7348 15.2911 26.5137 15.467C26.2926 15.643 26.1082 15.8609 25.9712 16.1083L21.9802 23.3036L19.6961 21.0154C19.4978 20.8097 19.2605 20.6456 18.9983 20.5327C18.736 20.4199 18.4539 20.3605 18.1684 20.358C17.883 20.3555 17.5999 20.41 17.3357 20.5183C17.0715 20.6265 16.8315 20.7865 16.6297 20.9887C16.4278 21.1909 16.2682 21.4313 16.1601 21.696C16.052 21.9607 15.9976 22.2443 16.0001 22.5302C16.0026 22.8162 16.0619 23.0988 16.1745 23.3616C16.2872 23.6243 16.451 23.862 16.6563 24.0606L20.9558 28.3679C21.3621 28.776 21.9103 29 22.4757 29L22.7735 28.9785C23.103 28.9323 23.4173 28.8101 23.6916 28.6216C23.966 28.433 24.193 28.1833 24.3546 27.892L29.729 18.2006C29.8662 17.9534 29.9535 17.6815 29.9858 17.4006C30.0182 17.1196 29.995 16.835 29.9175 16.563C29.8401 16.291 29.7099 16.037 29.5344 15.8154C29.359 15.5938 29.1417 15.409 28.8949 15.2716Z" fill="white" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="mb-0">Secured Vaults for all Group wallets</h3>
                                    </div>
                                </div>
                            </div>
                            <div className='col-lg-6'>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="icon-holder text-dark py-1 px-2 rounded mr-2">
                                        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="23" cy="23" r="23" fill="#FFBB22" />
                                            <path d="M28.8949 15.2716C28.6481 15.134 28.3767 15.0466 28.0962 15.0142C27.8156 14.9818 27.5315 15.0051 27.2599 15.0828C26.9884 15.1605 26.7348 15.2911 26.5137 15.467C26.2926 15.643 26.1082 15.8609 25.9712 16.1083L21.9802 23.3036L19.6961 21.0154C19.4978 20.8097 19.2605 20.6456 18.9983 20.5327C18.736 20.4199 18.4539 20.3605 18.1684 20.358C17.883 20.3555 17.5999 20.41 17.3357 20.5183C17.0715 20.6265 16.8315 20.7865 16.6297 20.9887C16.4278 21.1909 16.2682 21.4313 16.1601 21.696C16.052 21.9607 15.9976 22.2443 16.0001 22.5302C16.0026 22.8162 16.0619 23.0988 16.1745 23.3616C16.2872 23.6243 16.451 23.862 16.6563 24.0606L20.9558 28.3679C21.3621 28.776 21.9103 29 22.4757 29L22.7735 28.9785C23.103 28.9323 23.4173 28.8101 23.6916 28.6216C23.966 28.433 24.193 28.1833 24.3546 27.892L29.729 18.2006C29.8662 17.9534 29.9535 17.6815 29.9858 17.4006C30.0182 17.1196 29.995 16.835 29.9175 16.563C29.8401 16.291 29.7099 16.037 29.5344 15.8154C29.359 15.5938 29.1417 15.409 28.8949 15.2716Z" fill="white" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="mb-0">All transactions transparent to all members</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='row mt-5'>
                            <div className='col-lg-6'>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="icon-holder text-dark py-1 px-2 rounded mr-2">
                                        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="23" cy="23" r="23" fill="#FFBB22" />
                                            <path d="M28.8949 15.2716C28.6481 15.134 28.3767 15.0466 28.0962 15.0142C27.8156 14.9818 27.5315 15.0051 27.2599 15.0828C26.9884 15.1605 26.7348 15.2911 26.5137 15.467C26.2926 15.643 26.1082 15.8609 25.9712 16.1083L21.9802 23.3036L19.6961 21.0154C19.4978 20.8097 19.2605 20.6456 18.9983 20.5327C18.736 20.4199 18.4539 20.3605 18.1684 20.358C17.883 20.3555 17.5999 20.41 17.3357 20.5183C17.0715 20.6265 16.8315 20.7865 16.6297 20.9887C16.4278 21.1909 16.2682 21.4313 16.1601 21.696C16.052 21.9607 15.9976 22.2443 16.0001 22.5302C16.0026 22.8162 16.0619 23.0988 16.1745 23.3616C16.2872 23.6243 16.451 23.862 16.6563 24.0606L20.9558 28.3679C21.3621 28.776 21.9103 29 22.4757 29L22.7735 28.9785C23.103 28.9323 23.4173 28.8101 23.6916 28.6216C23.966 28.433 24.193 28.1833 24.3546 27.892L29.729 18.2006C29.8662 17.9534 29.9535 17.6815 29.9858 17.4006C30.0182 17.1196 29.995 16.835 29.9175 16.563C29.8401 16.291 29.7099 16.037 29.5344 15.8154C29.359 15.5938 29.1417 15.409 28.8949 15.2716Z" fill="white" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="mb-0">Accounts covered by multibank spread and insurance</h3>
                                    </div>
                                </div>
                            </div>
                            <div className='col-lg-6'>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="icon-holder text-dark py-1 px-2 rounded mr-2">
                                        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="23" cy="23" r="23" fill="#FFBB22" />
                                            <path d="M28.8949 15.2716C28.6481 15.134 28.3767 15.0466 28.0962 15.0142C27.8156 14.9818 27.5315 15.0051 27.2599 15.0828C26.9884 15.1605 26.7348 15.2911 26.5137 15.467C26.2926 15.643 26.1082 15.8609 25.9712 16.1083L21.9802 23.3036L19.6961 21.0154C19.4978 20.8097 19.2605 20.6456 18.9983 20.5327C18.736 20.4199 18.4539 20.3605 18.1684 20.358C17.883 20.3555 17.5999 20.41 17.3357 20.5183C17.0715 20.6265 16.8315 20.7865 16.6297 20.9887C16.4278 21.1909 16.2682 21.4313 16.1601 21.696C16.052 21.9607 15.9976 22.2443 16.0001 22.5302C16.0026 22.8162 16.0619 23.0988 16.1745 23.3616C16.2872 23.6243 16.451 23.862 16.6563 24.0606L20.9558 28.3679C21.3621 28.776 21.9103 29 22.4757 29L22.7735 28.9785C23.103 28.9323 23.4173 28.8101 23.6916 28.6216C23.966 28.433 24.193 28.1833 24.3546 27.892L29.729 18.2006C29.8662 17.9534 29.9535 17.6815 29.9858 17.4006C30.0182 17.1196 29.995 16.835 29.9175 16.563C29.8401 16.291 29.7099 16.037 29.5344 15.8154C29.359 15.5938 29.1417 15.409 28.8949 15.2716Z" fill="white" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="mb-0">Secured data and encryption</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='row mt-5'>
                            <div className='col-lg-6'>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="icon-holder text-dark py-1 px-2 rounded mr-2">
                                        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="23" cy="23" r="23" fill="#FFBB22" />
                                            <path d="M28.8949 15.2716C28.6481 15.134 28.3767 15.0466 28.0962 15.0142C27.8156 14.9818 27.5315 15.0051 27.2599 15.0828C26.9884 15.1605 26.7348 15.2911 26.5137 15.467C26.2926 15.643 26.1082 15.8609 25.9712 16.1083L21.9802 23.3036L19.6961 21.0154C19.4978 20.8097 19.2605 20.6456 18.9983 20.5327C18.736 20.4199 18.4539 20.3605 18.1684 20.358C17.883 20.3555 17.5999 20.41 17.3357 20.5183C17.0715 20.6265 16.8315 20.7865 16.6297 20.9887C16.4278 21.1909 16.2682 21.4313 16.1601 21.696C16.052 21.9607 15.9976 22.2443 16.0001 22.5302C16.0026 22.8162 16.0619 23.0988 16.1745 23.3616C16.2872 23.6243 16.451 23.862 16.6563 24.0606L20.9558 28.3679C21.3621 28.776 21.9103 29 22.4757 29L22.7735 28.9785C23.103 28.9323 23.4173 28.8101 23.6916 28.6216C23.966 28.433 24.193 28.1833 24.3546 27.892L29.729 18.2006C29.8662 17.9534 29.9535 17.6815 29.9858 17.4006C30.0182 17.1196 29.995 16.835 29.9175 16.563C29.8401 16.291 29.7099 16.037 29.5344 15.8154C29.359 15.5938 29.1417 15.409 28.8949 15.2716Z" fill="white" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="mb-0">Minimum of two (2) Managers per group </h3>
                                    </div>
                                </div>
                            </div>
                            <div className='col-lg-6'>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="icon-holder text-dark py-1 px-2 rounded mr-2">
                                        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="23" cy="23" r="23" fill="#FFBB22" />
                                            <path d="M28.8949 15.2716C28.6481 15.134 28.3767 15.0466 28.0962 15.0142C27.8156 14.9818 27.5315 15.0051 27.2599 15.0828C26.9884 15.1605 26.7348 15.2911 26.5137 15.467C26.2926 15.643 26.1082 15.8609 25.9712 16.1083L21.9802 23.3036L19.6961 21.0154C19.4978 20.8097 19.2605 20.6456 18.9983 20.5327C18.736 20.4199 18.4539 20.3605 18.1684 20.358C17.883 20.3555 17.5999 20.41 17.3357 20.5183C17.0715 20.6265 16.8315 20.7865 16.6297 20.9887C16.4278 21.1909 16.2682 21.4313 16.1601 21.696C16.052 21.9607 15.9976 22.2443 16.0001 22.5302C16.0026 22.8162 16.0619 23.0988 16.1745 23.3616C16.2872 23.6243 16.451 23.862 16.6563 24.0606L20.9558 28.3679C21.3621 28.776 21.9103 29 22.4757 29L22.7735 28.9785C23.103 28.9323 23.4173 28.8101 23.6916 28.6216C23.966 28.433 24.193 28.1833 24.3546 27.892L29.729 18.2006C29.8662 17.9534 29.9535 17.6815 29.9858 17.4006C30.0182 17.1196 29.995 16.835 29.9175 16.563C29.8401 16.291 29.7099 16.037 29.5344 15.8154C29.359 15.5938 29.1417 15.409 28.8949 15.2716Z" fill="white" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="mb-0">All transfers encrypted</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='text-center mt-5'>
                            <img className='logo w-50' src={("../../public/assets/images/webimage/Yellow.png")}></img>
                           <a href='https://play.google.com/store/apps/details?id=com.ohana.africa&hl=en&gl=US'> <img className='playstr mb-5 text-center' width={'150px'} src={("../../public/assets/images/webimage/google-play-logo1.png")}></img></a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default WebSite;