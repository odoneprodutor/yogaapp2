

import { Article, Comment } from '../types';
import { authService } from './auth';

const STORAGE_KEY_ARTICLES = 'yogaflow_custom_articles';

const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Os 8 Membros do Yoga',
    category: 'Filosofia',
    readTime: '5 min',
    author: 'Patanjali (Interpretação)',
    excerpt: 'Yoga é muito mais do que posturas físicas. Conheça o caminho completo descrito nos Yoga Sutras.',
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600',
    likes: 42,
    likedBy: [],
    comments: [],
    content: [
      'Muitas vezes, no ocidente, associamos Yoga apenas aos Asanas (posturas físicas). No entanto, o sábio Patanjali descreveu o Yoga como um caminho de oito passos (Ashtanga) para a iluminação e controle da mente.',
      '1. Yama: Códigos éticos de conduta (como não-violência e verdade).',
      '2. Niyama: Observâncias pessoais (como pureza, contentamento e autoestudo).',
      '3. Asana: A prática física para preparar o corpo para a meditação.',
      '4. Pranayama: Controle da respiração e da força vital.',
      '5. Pratyahara: A retirada dos sentidos do mundo externo.',
      '6. Dharana: Concentração intensa em um único objeto.',
      '7. Dhyana: Meditação, onde o fluxo de atenção é contínuo.',
      '8. Samadhi: O estado de absorção total e êxtase.',
      'Ao praticar no YogaFlow, você está vivenciando principalmente os Asanas e o Pranayama, mas a atitude mental que você traz para o tapete pode incorporar todos os outros membros.'
    ]
  },
  {
    id: '2',
    title: 'O Poder da Respiração Ujjayi',
    category: 'Anatomia',
    readTime: '3 min',
    author: 'Dra. Elena Costa',
    excerpt: 'Descubra como essa técnica simples de respiração pode acalmar seu sistema nervoso instantaneamente.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
    likes: 125,
    likedBy: [],
    comments: [
        { 
            id: 'c1', 
            userId: 'user1', 
            userName: 'Maria Silva', 
            text: 'Essa técnica mudou minha prática!', 
            createdAt: '2023-10-10T10:00:00Z',
            likes: 5,
            likedBy: [],
            replies: []
        }
    ],
    content: [
      'A respiração Ujjayi, frequentemente chamada de "respiração vitoriosa" ou "respiração do oceano", é fundamental em práticas como Vinyasa e Ashtanga. Ela é caracterizada por um som suave e sussurrante na garganta, semelhante às ondas do mar.',
      'Benefícios Fisiológicos: Ao estreitar levemente a glote, criamos uma resistência à passagem do ar. Isso aumenta a pressão intratorácica, melhora a troca gasosa e aquece o corpo de dentro para fora.',
      'Benefícios Mentais: O som rítmico serve como uma âncora para a mente. Quando você foca no som da sua respiração, é impossível estar preocupado com o passado ou o futuro. Você está presente.',
      'Como fazer: Inspire e expire pelo nariz. Mantenha a boca fechada. Ao expirar, contraia levemente a parte de trás da garganta, como se quisesse sussurrar, mas de boca fechada. Tente manter esse som durante toda a sua prática hoje.'
    ]
  },
  {
    id: '3',
    title: 'Superando a Dor Crônica: A História de Marcos',
    category: 'Inspiração',
    readTime: '4 min',
    author: 'Equipe YogaFlow',
    excerpt: 'Como um ex-atleta encontrou no Yoga a cura para suas lesões na coluna quando a medicina tradicional dizia que ele não correria mais.',
    imageUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&q=80&w=600',
    likes: 89,
    likedBy: [],
    comments: [],
    content: [
      'Marcos tinha 35 anos quando recebeu o diagnóstico: duas hérnias de disco que o impediriam de correr maratonas, sua grande paixão. A dor era constante, e os médicos sugeriam cirurgia como única opção, com riscos altos.',
      '"Eu me sentia traído pelo meu próprio corpo", conta Marcos. "Foi quando, por relutância, aceitei o convite de minha esposa para uma aula de Yoga Restaurativa."',
      'No início, a frustração era grande. Marcos estava acostumado a "empurrar" seus limites, e o Yoga pedia o oposto: escuta e gentileza. Mas, semana após semana, algo mudou. Ele aprendeu a fortalecer o core profundo (transverso abdominal) sem impacto.',
      'Seis meses depois, a dor diária havia diminuído em 80%. Um ano depois, ele não voltou a correr maratonas, mas descobriu que podia caminhar longas distâncias sem dor. Hoje, Marcos é professor de Yoga focado em reabilitação.',
      '"O Yoga não consertou minha coluna como mágica", diz ele. "Ele me ensinou a me mover de forma inteligente e a respeitar os sinais do meu corpo antes que eles virem gritos."'
    ]
  },
  {
    id: '4',
    title: 'Yoga para o Sono: A Ciência do Relaxamento',
    category: 'Benefícios',
    readTime: '3 min',
    author: 'Instituto do Sono',
    excerpt: 'Estudos mostram que 20 minutos de Yoga antes de dormir podem equivaler a uma hora extra de sono REM.',
    imageUrl: 'https://images.unsplash.com/photo-1544367563-12123d8966cd?auto=format&fit=crop&q=80&w=600',
    likes: 210,
    likedBy: [],
    comments: [],
    content: [
      'A insônia afeta milhões de pessoas, e muitas vezes a causa é um sistema nervoso simpático hiperativo (o modo de "luta ou fuga"). O Yoga noturno atua diretamente no sistema parassimpático, o modo de "descansar e digerir".',
      'Posturas como Viparita Karani (Pernas na Parede) e Balasana (Postura da Criança) reduzem os níveis de cortisol, o hormônio do estresse. Além disso, o alongamento suave libera a tensão muscular acumulada durante o dia, sinalizando ao cérebro que é seguro "desligar".',
      'Dica Prática: Tente fazer a postura "Pernas na Parede" por 5 minutos hoje à noite. Apague as luzes, deixe o telefone em outro cômodo e foque apenas em alongar a exalação.'
    ]
  },
  {
    id: '5',
    title: 'Ahimsa: A Não-Violência Começa Com Você',
    category: 'Filosofia',
    readTime: '4 min',
    author: 'Sarah V.',
    excerpt: 'Como ser gentil consigo mesmo no tapete de yoga pode transformar seus relacionamentos fora dele.',
    imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=600',
    likes: 56,
    likedBy: [],
    comments: [],
    content: [
      'Ahimsa é o primeiro Yama (código ético) do Yoga. Significa não-violência. Geralmente pensamos nisso como não ferir os outros, mas no contexto da prática de asanas, Ahimsa significa não forçar seu corpo em posturas para as quais ele não está pronto.',
      'Quantas vezes você se criticou mentalmente por não conseguir tocar os pés? Ou forçou um alongamento até sentir dor só para "conseguir" a postura?',
      'Isso é uma forma de violência contra si mesmo. Praticar Ahimsa é aceitar onde você está hoje. É entender que seu corpo varia de dia para dia.',
      'Quando aprendemos a ser compassivos com nossas próprias limitações no tapete, essa compaixão transborda. Tornamo-nos mais pacientes com os erros dos outros, menos reativos no trânsito e mais gentis com nossos parceiros. O Yoga começa dentro.'
    ]
  }
];

export const knowledgeBase = {
  getAllArticles: () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_ARTICLES);
        if (stored) {
            return JSON.parse(stored) as Article[];
        }
        
        // Fix: Return a deep copy to prevent mutation of the CONSTANT in memory
        const initialCopy = JSON.parse(JSON.stringify(INITIAL_ARTICLES));
        localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(initialCopy));
        return initialCopy;
    } catch (e) {
        console.error("Error loading articles", e);
        return JSON.parse(JSON.stringify(INITIAL_ARTICLES));
    }
  },
  
  getDailyArticle: () => {
    const all = knowledgeBase.getAllArticles();
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % all.length;
    return all[index];
  },

  getArticleById: (id: string) => knowledgeBase.getAllArticles().find(a => a.id === id),
  
  getByCategory: (category: string) => knowledgeBase.getAllArticles().filter(a => a.category === category),

  addArticle: (article: Article) => {
      try {
          const articles = knowledgeBase.getAllArticles();
          articles.unshift(article); // Add to top
          localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
      } catch (e) {
          console.error("Error adding article", e);
          throw e;
      }
  },

  deleteArticle: (articleId: string) => {
      try {
          const articles = knowledgeBase.getAllArticles();
          const filtered = articles.filter(a => a.id !== articleId);
          localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(filtered));
          return filtered;
      } catch (e) {
          console.error("Error deleting article", e);
          return knowledgeBase.getAllArticles();
      }
  },

  toggleLike: (articleId: string, userId: string) => {
      const articles = knowledgeBase.getAllArticles();
      const articleIndex = articles.findIndex(a => a.id === articleId);
      
      if (articleIndex > -1) {
          const article = articles[articleIndex];
          // Ensure likedBy exists (migration support)
          if (!article.likedBy) article.likedBy = [];

          const hasLiked = article.likedBy.includes(userId);
          
          if (hasLiked) {
              // Unlike
              article.likes = Math.max(0, article.likes - 1);
              article.likedBy = article.likedBy.filter(id => id !== userId);
          } else {
              // Like
              article.likes += 1;
              article.likedBy.push(userId);
          }

          localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
          return articles[articleIndex];
      }
      return null;
  },

  addComment: (articleId: string, text: string) => {
      const articles = knowledgeBase.getAllArticles();
      const articleIndex = articles.findIndex(a => a.id === articleId);
      const user = authService.getCurrentUser();

      if (articleIndex > -1 && user) {
          const newComment: Comment = {
              id: Date.now().toString(),
              userId: user.id,
              userName: user.name,
              text: text,
              createdAt: new Date().toISOString(),
              likes: 0,
              likedBy: [],
              replies: []
          };
          
          if (!articles[articleIndex].comments) articles[articleIndex].comments = [];
          
          articles[articleIndex].comments.push(newComment);
          localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
          return articles[articleIndex];
      }
      return null;
  },

  // Helper function to recursively find and update a comment
  updateCommentInTree: (comments: Comment[], commentId: string, updateFn: (c: Comment) => void): boolean => {
      for (const comment of comments) {
          if (comment.id === commentId) {
              updateFn(comment);
              return true;
          }
          if (comment.replies && comment.replies.length > 0) {
              if (knowledgeBase.updateCommentInTree(comment.replies, commentId, updateFn)) return true;
          }
      }
      return false;
  },

  toggleCommentLike: (articleId: string, commentId: string, userId: string) => {
      const articles = knowledgeBase.getAllArticles();
      const articleIndex = articles.findIndex(a => a.id === articleId);

      if (articleIndex > -1) {
          const article = articles[articleIndex];
          
          const success = knowledgeBase.updateCommentInTree(article.comments, commentId, (comment) => {
              if (!comment.likedBy) comment.likedBy = [];
              const hasLiked = comment.likedBy.includes(userId);
              
              if (hasLiked) {
                  comment.likes = Math.max(0, comment.likes - 1);
                  comment.likedBy = comment.likedBy.filter(id => id !== userId);
              } else {
                  comment.likes += 1;
                  comment.likedBy.push(userId);
              }
          });

          if (success) {
              localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
              return article;
          }
      }
      return null;
  },

  addReply: (articleId: string, parentCommentId: string, text: string) => {
      const articles = knowledgeBase.getAllArticles();
      const articleIndex = articles.findIndex(a => a.id === articleId);
      const user = authService.getCurrentUser();

      if (articleIndex > -1 && user) {
          const article = articles[articleIndex];
          const newReply: Comment = {
              id: Date.now().toString(),
              userId: user.id,
              userName: user.name,
              text: text,
              createdAt: new Date().toISOString(),
              likes: 0,
              likedBy: [],
              replies: []
          };

          const success = knowledgeBase.updateCommentInTree(article.comments, parentCommentId, (comment) => {
              if (!comment.replies) comment.replies = [];
              comment.replies.push(newReply);
          });

          if (success) {
              localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
              return article;
          }
      }
      return null;
  }
};
