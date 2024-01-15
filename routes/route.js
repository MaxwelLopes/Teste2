const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user'); 
const Post = require('../models/post');

// Rota para renderizar a home
router.get('/', async (req, res) => {
    // Verifica se há um usuário na sessão
    if (req.session.user) {
        // Busca o usuário no banco de dados usando o e-mail armazenado na sessão
        const user = await User.findOne({ where: { email: req.session.user.email } });

        const postsAll = await Post.findAll();
        const posts = postsAll.reverse();

        // Renderiza a página 'index' com os detalhes do usuário
        res.render('index', { user, posts });
    } else {
        // Se não houver usuário na sessão, renderiza a página de login sem mensagens de erro
        res.render('login', { message: null });
    }
});

// Rota para processar o formulário de login
router.post('/', async (req, res) => {
    // Obtém o e-mail e senha do corpo da requisição
    const email = req.body.email;
    const password = req.body.password;

    // Busca o usuário no banco de dados usando o e-mail fornecido
    const user = await User.findOne({ where: { email: email } });

    // Verifica se o usuário existe e se a senha está correta
    if (!user || !(await bcrypt.compare(password, user.password))) {
        // Se o usuário não existir ou a senha estiver incorreta, renderiza a página de login com mensagem de erro
        return res.render('login', { message: 'Email e/ou senha incorreta', value: email || '' });
    }

    // Salva o usuário na sessão
    req.session.user = user;
    
    // Redireciona para a página inicial após o login
    res.redirect('/');
});

// Rota para renderizar a página de cadastro
router.get('/singup', (req, res) => {
    res.render('singup', { message: null, value: null });
    // Destrói a sessão
    req.session.destroy();
});

// Rota para processar o formulário de cadastro
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Verifica se o e-mail já está cadastrado
        const existingUser = await User.findOne({ where: { email: email } });

        if (existingUser) {
            // Se o e-mail já estiver cadastrado, renderiza a página de cadastro com uma mensagem de erro
            let value = {
                name: name,
                email: email,
            };
            // Destrói a sessão
            req.session.destroy();
            return res.render('singup', { message: 'Email já cadastrado.', value: value });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Cria um novo usuário
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        // Salva o novo usuário no banco de dados
        await newUser.save();

        // Renderiza a página de login com uma mensagem indicando que o cadastro foi realizado com sucesso
        res.render('login', {
            message: 'Cadastro realizado com sucesso. Faça login para continuar.', value: email});
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota para realizar o logout
router.get('/logout', (req, res) => {
    // Destroi a sessão e redireciona para a página de login
    req.session.destroy();
    res.redirect('/login');
});


router.post('/create-post', async (req, res) => {
    try {
        // Verifica se há um usuário na sessão
        if (!req.session.user) {
            // Se não houver usuário na sessão, redireciona para a página de login
            return res.redirect('/login');
        }

        // Obtém o conteúdo do post do corpo da requisição
        const postContent = req.body.postContent;

        // Obtém o nome do autor a partir da sessão
        const authorName = req.session.user.name;

        // Cria o novo post
        const newPost = new Post({
            content: postContent,
            author: authorName,
        });

        // Salva o novo post no banco de dados
        await newPost.save();

        // Redireciona de volta para a página inicial após a criação do post
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
    }
});


module.exports = router;
