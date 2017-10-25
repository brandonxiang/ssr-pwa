/**
 * @file router
 * @author 项伟平(xiangweiping103@pingan.com.cn)
 */

import Vue from 'vue';
import Router from 'vue-router';

// 定义切割点，异步加载路由组件
let Hello = () => import('@/views/Hello.vue');


Vue.use(Router);

export function createRouter() {
    let router = new Router({

        // history 模式，需要服务器后端配合做路由代理，将所有的前端路由同步代理到 /
        mode: 'history',
        routes: [
            {
                path: '/',
                name: 'Hello',
                component: Hello
            }
        ]
    });

    return router;
}

