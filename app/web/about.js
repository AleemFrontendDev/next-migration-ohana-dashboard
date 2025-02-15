import React, { useState } from 'react';
import Link from 'next/link';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Modal from 'react-bootstrap/Modal';
import { ROUTES } from '@/utils/common';
export function About() {
    const [lgShow, setLgShow] = useState(false);
    return (
        <>
            <div className='container mt-5'>
                <div className='row'>
                    <div className='col-lg-8 col-md-6 col-sm-3 mt-5'>
                        <h1 className='font-weight-bold text-warning ftsiz'>Our number one goal is to empower families, communities and groups</h1>
                        <h1 className='text-muted'>strengthen their bonds and do good things in the world.</h1>
                    </div>
                    <div className='col-lg-4 col-md-6 col-sm-3 mt-5'>
                        <img alt="banner" className='w-100' src={"../../public/assets/images/webimage/Frame.png"}></img>
                    </div>
                </div>
            </div>
            <div className='bg-warning w-100'>
                <div className='container mt-5'>
                    <div className='row'>
                        <div className='col-lg-6 col-md-6 col-sm-3'>
                            <img alt="banner" className='w-100' src={"../../public/assets/images/webimage/shutterstock.png"}></img>
                        </div>
                        <div className='col-lg-6 col-md-6 col-sm-3'>
                            <h3 className='font-weight-bold mt-5'>Ohana’s mission is to build a better world encouraging family, communities and groups to pool money together for good in the world. </h3>
                            <div className='mt-4'>
                                <span className='font-weight-bold'>Belonging to something bigger than oneself, feeling supported and getting together to do good in the world brings more happiness and joy to all.</span>
                            </div>
                            <div className='mt-4 pb-4'>
                                <span className='font-weight-bold mt-5'>Everything we do is geared toward helping families, communities and groups get closer, stronger, and more resilient by pooling money into a common wallet, and use it for whatever good they choose. </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='container mt-5'>
                <div className='row'>
                    <div className='col-lg-8 col-md-6 col-sm-3'>
                        <h1 className='font-weight-bold text-warning mrgnn'>It’s all about</h1>
                        <h1 className=''>Communities building and getting together for good in the world </h1>
                        <div className='d-flex mt-5'>
                            <img alt="banner" className='logo w-50' src={"../../assets/public/images/webimage/Yellow.png"}></img>
                            <img alt="banner" className='playstr mb-5 text-center' width={'150px'} src={"../../public/assets/images/webimage/google-play-logo1.png"}></img>
                        </div>
                    </div>
                    <div className='col-lg-4 col-md-6 col-sm-3'>
                        <img alt="banner" className='w-100' src={"../../publick/assets/images/webimage/image 12.png"}></img>
                    </div>
                </div>
            </div>
            <div className='rang w-100'>
                <div className='container mt-5'>
                    <div className='row'>
                        <div className='col-lg-6 col-md-6 col-sm-3'>
                            <img alt="banner" className='w-100' src={"../../public/assets/images/webimage/Group 23.png"}></img>
                        </div>
                        <div className='col-lg-6 col-md-6 col-sm-3'>
                            <h1 className='font-weight-bold vlaue'>Values we live by.</h1>
                            <div className='mt-4'>
                                <span className='' style={{ fontSize: "22px" }}>Ohana’s Values are <strong> Ubuntu, Passion, Service, Integrity and Innovation</strong></span>
                            </div>
                            <div className='mt-4'>
                                <span className='' style={{ fontSize: "22px" }}>Every week, we sit with our communities and groups to help them achieve their goals and encourage them to do more with better tools.  </span>
                            </div>
                        </div>
                    </div>
                    <div className='row mt-5'>
                        <div className='col-lg-12 col-md-12 col-sm-3'>
                            <img alt="banner" className='w-100' style={{ marginBottom: "5rem" }} src={"../../public/assets/images/webimage/Group 24.png"}></img>
                        </div>
                    </div>
                </div>
            </div>
            <div className='bg-warning'>
                <h1 className='text-center font-weight-bold py-5 text-black'>The Ohana Story</h1>
                <div className='container pt-5'>
                    <div className="row" id='row1'>
                        <div className="col-md-2 shani">
                            {['top'].map((placement) => (
                                <OverlayTrigger
                                    key={placement}
                                    placement={'top'}
                                    overlay={
                                        <Tooltip id={`tooltip-${placement}`}>
                                            <h6>{new Date().getFullYear()}</h6>
                                            <span>Launch of Haagbo Inc, the parent company of Ohana founded by KOUTONIN Mawuna to incubate Africa digital transformation ideas</span>
                                        </Tooltip>
                                    }
                                >
                                    <center className="wth">
                                        <div className="text-center" id="col" variant="secondary"></div>
                                        <span className='font-weight-semibold text-black'>{new Date().getFullYear()}</span>
                                    </center>
                                </OverlayTrigger>
                            ))}
                        </div>
                        <div className="col-md-2 shani">
                            {['top'].map((placement) => (
                                <OverlayTrigger
                                    key={placement}
                                    placement={'top'}
                                    overlay={
                                        <Tooltip id={`tooltip-${placement}`}>
                                            <h6>2023</h6>
                                            <span>Priming Global Growth of Ohana in Kenya, Togo, Nigeria, …</span>
                                        </Tooltip>
                                    }
                                >
                                    <center className="wth">
                                        <div className="text-center" id="col" variant="secondary"></div>
                                        <span className='font-weight-semibold text-black'>2023</span>
                                    </center>
                                </OverlayTrigger>
                            ))}
                        </div>
                        <div className="col-md-2 shani">
                            {['top'].map((placement) => (
                                <OverlayTrigger
                                    key={placement}
                                    placement={'top'}
                                    overlay={
                                        <Tooltip id={`tooltip-${placement}`}>
                                            <h6>2024</h6>
                                            <span>Leadership in 10+ countries </span>
                                        </Tooltip>
                                    }
                                >
                                    <center className="wth">
                                        <div className="text-center" id="col" variant="secondary"></div>
                                        <span className='font-weight-semibold text-black'>2024</span>
                                    </center>
                                </OverlayTrigger>
                            ))}
                        </div>
                        <div className="col-md-2 shani">
                            {['top'].map((placement) => (
                                <OverlayTrigger
                                    key={placement}
                                    placement={'top'}
                                    overlay={
                                        <Tooltip id={`tooltip-${placement}`}>
                                            <h6>2025</h6>
                                            <span>Unicorn Status, …</span>
                                        </Tooltip>
                                    }
                                >
                                    <center className="wth">
                                        <div className="text-center" id="col" variant="secondary"></div>
                                        <span className='font-weight-semibold text-black'>2025</span>
                                    </center>
                                </OverlayTrigger>
                            ))}
                        </div>
                        <div className="col-md-2 shani">
                            {['top'].map((placement) => (
                                <OverlayTrigger
                                    key={placement}
                                    placement={'top'}
                                    overlay={
                                        <Tooltip id={`tooltip-${placement}`}>
                                            <h6>2026</h6>
                                            <span>Expansion outside of Africa </span>
                                        </Tooltip>
                                    }
                                >
                                    <center className="wth">
                                        <div className="text-center" id="col" variant="secondary"></div>
                                        <span className='font-weight-semibold text-black'>2026</span>
                                    </center>
                                </OverlayTrigger>
                            ))}
                        </div>
                        <div className="col-md-2 shani">
                            {['top'].map((placement) => (
                                <OverlayTrigger
                                    key={placement}
                                    placement={'top'}
                                    overlay={
                                        <Tooltip id={`tooltip-${placement}`}>
                                            <h6>2027</h6>
                                            <span>Household Brand Name </span>
                                        </Tooltip>
                                    }
                                >
                                    <center className="wth">
                                        <div className="text-center" id="col" variant="secondary"></div>
                                        <span className='font-weight-semibold text-black'>2027</span>
                                    </center>
                                </OverlayTrigger>
                            ))}
                        </div>
                    </div>
                    <div className='row w-100 py-5 mt-5'>
                    </div>
                </div>
            </div>
            <div className='container'>
                <div className='row'>
                    <div className='col-lg-6 col-md-6 col-sm-3'>
                        <img alt="banner" className='w-100' src={("../../assets/images/webimage/shutterstock_2.png")}></img>
                    </div>
                    <div className='col-lg-6 col-md-6 col-sm-3'>
                        <h1 className='font-weight-bold text-black' style={{ marginTop: "10rem", fontSize: '3rem' }}>Ready to join</h1>
                        <div className='mt-5'>
                            <img alt="banner" className='w-100 logo mb-5' src={("../../assets/images/webimage/Yellow.png")}></img>
                            <img alt="banner" className='playstr mb-5 text-center' width={'150px'} src={("../../assets/images/webimage/google-play-logo1.png")}></img>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-warning">
                <div className="container py-2 h-100">
                    <div className="row g-0">
                        <div className="col-lg-12">
                            <div className="card-body p-md-5 mx-md-4">
                                <h1 className='font-weight-bold text-center' style={{ marginTop: "1rem" }}>More about Ohana</h1>
                                <div className="text-center pb-4 mt-4">
                                    <Link href={ ROUTES.leadership }>
                                        <button type="submit" name="send" value="send" className="text-justify btn btn-dak bg-dark text-white pr-4 mr-3 mrg" style={{ fontSize: '2rem' }}> Leadership<i className="mdi mdi-arrow-right"></i> </button>
                                    </Link>
                                    <button className="text-justify btn btn-dak bg-dark text-white pr-4 mrg" onClick={() => setLgShow(true)} style={{ fontSize: '2rem' }}> How It Works <i className="mdi mdi-arrow-right"></i> </button>
                                </div>
                                <div className="text-center pb-4">
                                    <Link href={ ROUTES.careers }>
                                        <button type="submit" name="send" value="send" className="text-justify btn btn-dak bg-dark text-white pr-5 mr-3 mrg" style={{ fontSize: '2rem' }}> Careers <i className="mdi mdi-arrow-right"></i> </button>
                                    </Link>
                                    <Link href={ ROUTES.press }>
                                        <button type="submit" name="send" value="send" className="text-justify btn btn-dak bg-dark text-white pr-5 mrg" style={{ fontSize: '2rem' }}> Press <i className="mdi mdi-arrow-right"></i> </button>
                                    </Link>
                                </div>
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
                        <iframe width="100%" height="506" src="https://www.youtube.com/embed/vRClbTsn5r0" title="Ohana, Fintech for Groups" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </Modal>
                </div>
            </div>
        </>
    );
}
export default About;