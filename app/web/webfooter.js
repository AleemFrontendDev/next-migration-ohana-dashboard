'use client'
import Link from 'next/link';
import { Trans } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { ROUTES } from '@/utils/common';
export function WebFooter() {
    const [lgShow, setLgShow] = useState(false);
    const [lgShow1, setLgShow1] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        window.addEventListener("scroll", () => {
            if (window.pageYOffset > 300) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }
        });
    }, []);

    // This function will scroll the window to the top 
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // for smoothly scrolling
        });
    };
    return (
        <>
            {/* Footer */}
            <div className='container mt-4'>
                <h3 className='font-weight-bold'>Partners</h3>
                <div className='row align-items-center'>
                    <div className='col-lg-3 col-md-3'>
                        <img style={{ cursor: "pointer" }} className='img-thumbnail shadow' alt='img' src={("../../public/assets/images/webimage/partners/Ecobank-logo.png")}></img>
                    </div>
                    <div className='col-lg-3 col-md-3'>
                        <img style={{ cursor: "pointer" }} className="img-thumbnail shadow" alt='img' src={("../../public/assets/images/webimage/partners/Interswitch-logo.png")}></img>
                    </div>
                    <div className='col-lg-3 col-md-3'>
                        <img style={{ cursor: "pointer" }} className="img-thumbnail shadow" alt='img' src={("../../public/assets/images/webimage/partners/Tmoney-logo.png")}></img>
                    </div>
                    <div className='col-lg-3 col-md-3'>
                        <img style={{ cursor: "pointer" }} className="img-thumbnail shadow" alt='img' src={("../../public/assets/images/webimage/partners/Mpesa-logo-f.png")}></img>
                    </div>
                </div>
                <div className='row' style={{ marginTop: "6rem" }}>
                    <div className='col-lg-3 col-md-3'>
                        <h3 className='font-weight-bold'>Ohana Togo</h3>
                        <ul className="contact-info">
                            <li>Haagbo SarlU</li>
                            <li>Rue du Cimetière Afeyekpota</li>
                            <li>BP 76 Atakpamé</li>
                        </ul>
                    </div>
                    <div className='col-lg-3 col-md-3'>
                        <h3 className='font-weight-bold'>Ohana Kenya</h3>
                        <ul className="contact-info">
                            <li>Kakouka Company Ltd</li>
                            <li>00502 Karen, Nairobi</li>
                            <li>P.O BOX 24212</li>
                        </ul>
                    </div>
                    <div className='col-lg-3 col-md-3'>
                        <h3 className='font-weight-bold'>Ohana Nigeria</h3>
                        <ul className="contact-info">
                            <li>Haagbo Solutions Nigeria Ltd</li>
                            <li>Plot P6, Victoria Garden City</li>
                            <li>Lekki, Lagos State</li>
                        </ul>
                    </div>
                    <div className='col-lg-3 col-md-3'>
                        
                    </div>
                    <div className='mt-4'>
                        <img className='mr-2 logo' style={{ cursor: "pointer" }} width={'150px'} alt='img' src={("../../public/assets/images/webimage/google-play-logo1.png")} onClick={() => setLgShow(true)}></img>
                        <a href='https://play.google.com/store/apps/details?id=com.ohana.africa&hl=en&gl=US'> <img className='playstr mr-2 text-center' width={'150px'} alt='img' src={("../../public/assets/images/webimage/google-play-logo1.png")}></img></a>
                        <img style={{ cursor: "pointer" }} width={'150px'} alt='img' src={("../../public/assets/images/webimage/pngegg.png")} onClick={() => setLgShow1(true)}></img>
                    </div>
                </div>
                <hr></hr>
            </div>
            <div className='container mb-5'>
                <div className='row'>
                    <div className='col-lg-4 col-md-3'>
                        <small className='text-muted'>©{new Date().getFullYear()} ohana All right reseverd</small>
                    </div>
                    <div className='col-lg-2 col-md-2'>
                        <Link href={ ROUTES.web }>
                            <small className='text-muted'><Trans>Home</Trans></small>
                        </Link>
                    </div>
                    <div className='col-lg-2 col-md-2'>
                        <Link href={ ROUTES.about }>
                            <small className='text-muted'><Trans>About us</Trans></small>
                        </Link>
                    </div>
                    <div className='col-lg-2 col-md-3'>
                        <Link href={ ROUTES.terms_conditions }>
                            <small className='text-muted'><Trans>Terms & Services</Trans></small>
                        </Link>
                    </div>
                    <div className='col-lg-2 col-md-2'>
                        <Link href={ ROUTES.privacy_policy }>
                            <small className='text-muted'><Trans>Privacy Policy</Trans></small>
                        </Link>
                    </div>
                </div>
            </div>

            <Modal
                size="lg"
                show={lgShow}
                onHide={() => setLgShow(false)}
                aria-labelledby="example-modal-sizes-title-lg"
                style={{ paddingleft: 'none !important' }}

            >
                <Modal.Header className=''style={{ backgroundColor: "#FFBB22" }} closeButton>
                    {/* <Modal.Title id="example-modal-sizes-title-lg">
                            Large Modal
                        </Modal.Title> */}
                </Modal.Header>
                <Modal.Body className=''  style={{ backgroundColor: "#FFBB22" }}>
                <img className='w-100' alt='img' src={("../../public/assets/images/webimage/modal.jpeg")}></img>
                    {/* <h1 className='font-weight-bold text-center' style={{ fontSize: "2rem" }}>JOIN YOUR CHURCH OHANA GROUP</h1> */}
                    {/* <div className='row'>
                        <div className='col-lg-4 col-md-6'>
                            <div className='text-center mt-2'>
                                <img className='' height={'300px'} alt='img' src={("../../public/assets/images/webimage/Phone.png")}></img>
                            </div>
                        </div>
                        <div className='col-lg-8 col-md-6'>
                            <h5 className='font-weight-bold text-white mt-2' style={{ fontSize: "2rem" }}>Ready To GO ?</h5>
                            <h6 className='ml-4'>Join Ohana Today!</h6>
                            <div className='mt-4'>
                                <img className='w-100 h-100' height={'100px'} alt='img' src={("../../public/assets/images/webimage/Group 138.png")}></img>
                                <div className='pl-4'>
                                        <h1 className='text-primary'>Download Now</h1>
                                        <h4>Scan This Code With </h4>
                                        <h4>Your Phone's Camera </h4>
                                    </div>
                                <img className='mt-2 w-100' height={'100px'} alt='img' src={("../../public/assets/images/webimage/2B 1.png")}></img>
                            </div>
                        </div>
                    </div> */}
                    {/* <div className='row mt-2'>
                        <div className='col-lg-6 col-md-12 col-sm-3'>
                            <h1 className='ml-3 font-weight-bold' style={{ fontSize: "2rem" }}>Together for Good.</h1>
                            <h5 className='text-white ml-3'>Making communities, families and friends bonds stronger with Group Money Pool</h5>
                        </div>
                        <div className='col-lg-3 col-md-6 col-sm-3'>
                            <div>
                                <h1 className='text-light text-center' style={{ fontSize: "2rem" }}>500k+</h1>
                                <h5 className='font-weight-semibold text-center'>Ohana Groups</h5>
                            </div>
                            <div className='mt-3'>
                                <h1 className='text-light text-center' style={{ fontSize: "2rem" }}>50B+</h1>
                                <h5 className='font-weight-semibold text-center'>In Groups Vaults</h5>
                            </div>
                        </div>
                        <div className='col-lg-3 col-md-6 col-sm-3'>
                            <div>
                                <h1 className='text-light text-center' style={{ fontSize: "2rem" }}>15M+</h1>
                                <h5 className='font-weight-semibold text-center'>Ohana Members</h5>
                            </div>
                            <div className='mt-3'>
                                <h1 className='text-light text-center' style={{ fontSize: "2rem" }}>12+</h1>
                                <h5 className='font-weight-semibold text-center'>Countries covered</h5>
                            </div>
                        </div>
                    </div>
                    <div className='row mt-2'>
                        <div className='col-lg-4'>
                            <div className='d-flex justify-content-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18.715" height="18.715" viewBox="0 0 18.715 18.715">
                                    <g id="Group_66" data-name="Group 66" transform="translate(0.5 0.5)">
                                        <path id="primary" d="M20.715,11.857A8.857,8.857,0,1,1,11.857,3,8.857,8.857,0,0,1,20.715,11.857ZM11.857,3C10.224,3,8.9,6.937,8.9,11.857s1.319,8.857,2.952,8.857,2.952-3.937,2.952-8.857S13.491,3,11.857,3Z" transform="translate(-3 -3)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                        <path id="primary-2" data-name="primary" d="M18.944,17.381A9.488,9.488,0,0,0,14.6,15.3a12.646,12.646,0,0,0-5.461,0A9.488,9.488,0,0,0,4.8,17.381" transform="translate(-3.014 -3.204)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                        <path id="primary-3" data-name="primary" d="M18.944,6.6A9.488,9.488,0,0,1,14.6,8.683a12.191,12.191,0,0,1-2.731.3,12.191,12.191,0,0,1-2.731-.3A9.488,9.488,0,0,1,4.8,6.6" transform="translate(-3.014 -3.061)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                    </g>
                                </svg>
                                <div className='ml-2'>
                                    <span className='text-dark'>https://ohana.africa</span>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className='d-flex justify-content-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14.222" viewBox="0 0 18 14.222">
                                    <path id="primary" d="M19.056,18.222H3.944A.944.944,0,0,1,3,17.278V5.944A.944.944,0,0,1,3.944,5H19.056A.944.944,0,0,1,20,5.944V17.278A.944.944,0,0,1,19.056,18.222ZM3.642,5.425l7.272,5.723a.944.944,0,0,0,1.171,0l7.272-5.723" transform="translate(-2.5 -4.5)" fill="rgba(0,0,0,0)" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                </svg>
                                <div className='ml-2'>
                                    <span className='text-dark'>Contact@ohana.africa</span>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className='d-flex justify-content-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16.023" height="16.034" viewBox="0 0 16.023 16.034">
                                    <g id="Group_95" data-name="Group 95" transform="translate(-531.483 -962.006)">
                                        <g id="Group_69" data-name="Group 69" transform="translate(532 962.514)">
                                            <path id="Path_337" data-name="Path 337" d="M15.578,21.685a13.844,13.844,0,0,1-4.548-2l1.907-2.735a2.1,2.1,0,0,1,2.809-.534c.346.22.7.419,1.048.618a2.1,2.1,0,0,1,.88,2.955l-.65,1a1.226,1.226,0,0,1-1.446.7ZM3.7,7.715l1.048-.65a2.1,2.1,0,0,1,2.987.765,9.872,9.872,0,0,0,.618,1.048,2.1,2.1,0,0,1-.534,2.809L5.035,13.626A13.844,13.844,0,0,1,3,9.109a1.226,1.226,0,0,1,.7-1.394Z" transform="translate(-2.971 -6.728)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                            <path id="Path_338" data-name="Path 338" d="M4.94,13.31a18.571,18.571,0,0,0,2.7,3.322,18.571,18.571,0,0,0,3.322,2.7" transform="translate(-2.876 -6.412)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                        </g>
                                    </g>
                                </svg>
                                <div className='ml-2'>
                                    <span className='text-dark'>+228 92105147</span>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </Modal.Body>
            </Modal>

            <Modal
                size="sm"
                show={lgShow1}
                onHide={() => setLgShow1(false)}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header className='bg-warning' closeButton>
                    {/* <Modal.Title id="example-modal-sizes-title-lg">
                            Large Modal
                        </Modal.Title> */}
                </Modal.Header>
                <Modal.Body className='bg-warning' closeButton>
                    <h1 className='font-weight-bold text-center' style={{ fontSize: "2rem" }}>Coming Soon</h1>

                </Modal.Body>
            </Modal>
            {showButton && (
                <button onClick={scrollToTop} className="back-to-top">
                    <i className="mdi mdi-arrow-up"></i>
                </button>
            )}
        </>
    );
}
export default WebFooter;