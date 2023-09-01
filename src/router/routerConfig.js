import Home from 'components/panel/Home.jsx';

const routes = [
    {
        path: '/',
        redirect: '/home',
    },
    {
        path: '/home',
        component: Home,
    },
];

export default routes;
