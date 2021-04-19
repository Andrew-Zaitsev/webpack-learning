import * as $ from '~/jquery'; //тильда приводит к папке node-modules
import Post from './post.js';
import './babel'
import './styles/styles.css';
import SomeImg from '@/assets/ui Colors & Type.png'; // пример использования алиаса из resolve - alias конфига вебпака
import './styles/less.less';
import './styles/scss.scss';
//import json from './assets/package.json';

const post = new Post('Webpack post title', SomeImg);

$('pre').addClass('json').html(post.toString());

//console.log('post to string', post.toString());
console.log('hello');