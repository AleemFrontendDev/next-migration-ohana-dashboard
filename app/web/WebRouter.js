import { Suspense, lazy } from 'react';
// // import { Routes, Route } from 'react-router-dom';
// import Spinner from '@/components/Spinner/Spinner';
// import { ROUTES } from '@/utils/common';

const WebSite = lazy(() => import('./index'));
const About = lazy(() => import('./about'));
const RemoveAccount = lazy(() => import('./remove-account'));
const Leadership = lazy(() => import('./leadership'));
const Careers = lazy(() => import('./careers'));
const Press = lazy(() => import('./press'));
const TermsConditions = lazy(() => import('./terms-conditions'));
const PrivacyPolicy = lazy(() => import('./privacy-policy'));

export default function WebRoutes() {
  return (
    <>
      <About/>
      <RemoveAccount/>
      <Leadership/>
      <Careers/>
      <Press/>
      <TermsConditions/>
      <PrivacyPolicy/>
      <WebSite/>
    </>
  );
}