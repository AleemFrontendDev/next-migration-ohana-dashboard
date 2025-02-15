
import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Link from 'next/link';
import { Trans } from 'react-i18next';
import './style.css';
import { Container } from 'react-bootstrap';
import { ROUTES } from '@/utils/common';
export function WebHeader() {
    return (
        <>
            <Navbar expand="lg" bg="white" variant="dark" fixed="top" style={{ zIndex: 2 }}>
                <Container className='px-3'>
                    <Link href={ ROUTES.web }>
                        <Navbar.Brand className="text-dark font-weight-bold">Ohana.Africa</Navbar.Brand>
                    </Link>
                    {/* <Navbar.Toggle className="bg-warning" aria-controls="responsive-navbar-nav" /> */}
                        <Nav className="m-auto">
                            {/* <Link className="nav-link text-dark font-weight-semibold" to={ ROUTES.web }>
                                <span className="menu-title"><Trans>Home</Trans></span>
                            </Link> */}
                            <Link className="nav-Nav.Link text-dark font-weight-semibold" href={ ROUTES.about }>
                                <span className="menu-title"><Trans>About us</Trans></span>
                            </Link> 
                        </Nav>
                </Container>
            </Navbar>
        </>
    );
}
export default WebHeader;