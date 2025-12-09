import { Pose } from './types';

// Helper to generate placeholder images/videos
const getImg = (text: string) => `https://placehold.co/600x400/e7e5e4/44403c?text=${encodeURIComponent(text)}`;
const getVideo = () => `https://www.youtube.com/embed/v7AYKMP6rOE?autoplay=1&mute=1&controls=0&loop=1`; // Generic peaceful nature background as placeholder

export const POSES: Pose[] = [
  // RESPIRAÇÃO (PRANAYAMA)
  {
    id: '100',
    sanskritName: 'Nadi Shodhana',
    portugueseName: 'Respiração das Narinas Alternadas',
    difficulty: 'Iniciante',
    category: 'Respiração',
    benefits: ['Equilíbrio Mental', 'Redução de Stress', 'Foco'],
    media: { thumbnailUrl: getImg('Nadi Shodhana'), videoEmbedUrl: getVideo() },
    durationDefault: 180,
    description: 'Use o polegar e o anelar para fechar alternadamente as narinas, respirando de forma rítmica e suave.'
  },
  {
    id: '101',
    sanskritName: 'Kapalabhati',
    portugueseName: 'Respiração do Crânio Brilhante',
    difficulty: 'Intermediário',
    category: 'Respiração',
    benefits: ['Energia', 'Limpeza', 'Aquecimento'],
    media: { thumbnailUrl: getImg('Kapalabhati'), videoEmbedUrl: getVideo() },
    durationDefault: 120,
    description: 'Exalações curtas e vigorosas pelo nariz, com inalações passivas. Foco no movimento do abdômen.'
  },
  {
    id: '102',
    sanskritName: 'Sama Vritti',
    portugueseName: 'Respiração Quadrada',
    difficulty: 'Iniciante',
    category: 'Respiração',
    benefits: ['Calma', 'Controle', 'Ansiedade'],
    media: { thumbnailUrl: getImg('Respiração Quadrada'), videoEmbedUrl: getVideo() },
    durationDefault: 180,
    description: 'Inspire em 4 tempos, segure 4 tempos, expire 4 tempos, segure vazio 4 tempos.'
  },

  // AQUECIMENTO
  {
    id: '1',
    sanskritName: 'Balasana',
    portugueseName: 'Postura da Criança',
    difficulty: 'Iniciante',
    category: 'Aquecimento',
    benefits: ['Relaxamento', 'Alívio de Dor nas Costas', 'Calma'],
    media: { thumbnailUrl: getImg('Balasana'), videoEmbedUrl: getVideo() },
    durationDefault: 60,
    description: 'Ajoelhe-se no chão, encoste os dedões dos pés e sente-se sobre os calcanhares, depois separe os joelhos na largura dos quadris.'
  },
  {
    id: '2',
    sanskritName: 'Marjaryasana-Bitilasana',
    portugueseName: 'Gato e Vaca',
    difficulty: 'Iniciante',
    category: 'Aquecimento',
    benefits: ['Flexibilidade da Coluna', 'Aquecimento', 'Alívio de Tensão'],
    media: { thumbnailUrl: getImg('Gato e Vaca'), videoEmbedUrl: getVideo() },
    durationDefault: 60,
    description: 'Mova a coluna suavemente entre o arco (Gato) e a extensão (Vaca) sincronizando com a respiração.'
  },
  {
    id: '3',
    sanskritName: 'Adho Mukha Svanasana',
    portugueseName: 'Cachorro Olhando para Baixo',
    difficulty: 'Iniciante',
    category: 'Aquecimento',
    benefits: ['Energia', 'Alongamento Posterior', 'Força nos Braços'],
    media: { thumbnailUrl: getImg('Cachorro Baixo'), videoEmbedUrl: getVideo() },
    durationDefault: 45,
    description: 'Forme um V invertido com o corpo, empurrando o chão com as mãos e tentando levar os calcanhares ao solo.'
  },
  {
    id: '4',
    sanskritName: 'Uttanasana',
    portugueseName: 'Flexão para Frente em Pé',
    difficulty: 'Iniciante',
    category: 'Aquecimento',
    benefits: ['Calma', 'Alongamento', 'Alívio de Stress'],
    media: { thumbnailUrl: getImg('Uttanasana'), videoEmbedUrl: getVideo() },
    durationDefault: 30,
    description: 'Em pé, expire e dobre-se para frente a partir dos quadris, mantendo a coluna longa.'
  },

  // PÉ (STANDING)
  {
    id: '5',
    sanskritName: 'Tadasana',
    portugueseName: 'Postura da Montanha',
    difficulty: 'Iniciante',
    category: 'Pé',
    benefits: ['Postura', 'Foco', 'Equilíbrio'],
    media: { thumbnailUrl: getImg('Tadasana'), videoEmbedUrl: getVideo() },
    durationDefault: 30,
    description: 'Fique em pé com as bases dos dedões se tocando, calcanhares levemente separados.'
  },
  {
    id: '6',
    sanskritName: 'Virabhadrasana I',
    portugueseName: 'Guerreiro I',
    difficulty: 'Iniciante',
    category: 'Pé',
    benefits: ['Força', 'Foco', 'Estabilidade'],
    media: { thumbnailUrl: getImg('Guerreiro I'), videoEmbedUrl: getVideo() },
    durationDefault: 45,
    description: 'Dê um passo grande para trás, gire o pé de trás 45 graus e dobre o joelho da frente.'
  },
  {
    id: '7',
    sanskritName: 'Virabhadrasana II',
    portugueseName: 'Guerreiro II',
    difficulty: 'Iniciante',
    category: 'Pé',
    benefits: ['Força nas Pernas', 'Abertura de Quadril', 'Resistência'],
    media: { thumbnailUrl: getImg('Guerreiro II'), videoEmbedUrl: getVideo() },
    durationDefault: 45,
    description: 'Braços estendidos para os lados, olhar focado sobre a mão da frente.'
  },
  {
    id: '8',
    sanskritName: 'Virabhadrasana III',
    portugueseName: 'Guerreiro III',
    difficulty: 'Intermediário',
    category: 'Pé',
    benefits: ['Equilíbrio', 'Core', 'Força nas Costas'],
    media: { thumbnailUrl: getImg('Guerreiro III'), videoEmbedUrl: getVideo() },
    durationDefault: 30,
    description: 'Equilibre-se em uma perna, inclinando o tronco à frente e estendendo a outra perna para trás.'
  },
  {
    id: '9',
    sanskritName: 'Trikonasana',
    portugueseName: 'Postura do Triângulo',
    difficulty: 'Iniciante',
    category: 'Pé',
    benefits: ['Alongamento Lateral', 'Estabilidade', 'Digestão'],
    media: { thumbnailUrl: getImg('Triângulo'), videoEmbedUrl: getVideo() },
    durationDefault: 45,
    description: 'Estenda o braço para frente e desça a mão até a canela ou chão, abrindo o peito.'
  },
  {
    id: '10',
    sanskritName: 'Vrksasana',
    portugueseName: 'Postura da Árvore',
    difficulty: 'Iniciante',
    category: 'Pé',
    benefits: ['Equilíbrio', 'Foco', 'Calma'],
    media: { thumbnailUrl: getImg('Árvore'), videoEmbedUrl: getVideo() },
    durationDefault: 60,
    description: 'Apoie a sola do pé na parte interna da coxa ou panturrilha oposta. Junte as mãos no peito.'
  },
  {
    id: '11',
    sanskritName: 'Utkatasana',
    portugueseName: 'Postura da Cadeira',
    difficulty: 'Iniciante',
    category: 'Pé',
    benefits: ['Força nas Pernas', 'Calor', 'Energia'],
    media: { thumbnailUrl: getImg('Cadeira'), videoEmbedUrl: getVideo() },
    durationDefault: 30,
    description: 'Dobre os joelhos como se fosse sentar em uma cadeira imaginária, braços elevados.'
  },
  {
    id: '12',
    sanskritName: 'Garudasana',
    portugueseName: 'Postura da Águia',
    difficulty: 'Intermediário',
    category: 'Pé',
    benefits: ['Equilíbrio', 'Abertura de Ombros', 'Foco'],
    media: { thumbnailUrl: getImg('Águia'), videoEmbedUrl: getVideo() },
    durationDefault: 45,
    description: 'Cruze uma perna sobre a outra e um braço sob o outro, unindo as palmas.'
  },

  // CORE & CHÃO
  {
    id: '13',
    sanskritName: 'Phalakasana',
    portugueseName: 'Prancha',
    difficulty: 'Iniciante',
    category: 'Core',
    benefits: ['Força Abdominal', 'Braços', 'Estabilidade'],
    media: { thumbnailUrl: getImg('Prancha'), videoEmbedUrl: getVideo() },
    durationDefault: 45,
    description: 'Mãos sob os ombros, corpo em linha reta dos calcanhares ao topo da cabeça.'
  },
  {
    id: '14',
    sanskritName: 'Navasana',
    portugueseName: 'Postura do Barco',
    difficulty: 'Intermediário',
    category: 'Core',
    benefits: ['Core', 'Equilíbrio', 'Digestão'],
    media: { thumbnailUrl: getImg('Barco'), videoEmbedUrl: getVideo() },
    durationDefault: 30,
    description: 'Equilibre-se nos ísquios, elevando as pernas e estendendo os braços à frente.'
  },
  {
    id: '15',
    sanskritName: 'Vasisthasana',
    portugueseName: 'Prancha Lateral',
    difficulty: 'Intermediário',
    category: 'Core',
    benefits: ['Força nos Braços', 'Obíquos', 'Equilíbrio'],
    media: { thumbnailUrl: getImg('Prancha Lateral'), videoEmbedUrl: getVideo() },
    durationDefault: 30,
    description: 'Apoie-se em uma mão e na borda externa do pé, elevando o quadril.'
  },

  // SENTADO & TORÇÕES
  {
    id: '16',
    sanskritName: 'Dandasana',
    portugueseName: 'Postura do Bastão',
    difficulty: 'Iniciante',
    category: 'Sentado',
    benefits: ['Postura', 'Alinhamento', 'Respiração'],
    media: { thumbnailUrl: getImg('Bastão'), videoEmbedUrl: getVideo() },
    durationDefault: 60,
    description: 'Sente-se com as pernas estendidas à frente, coluna ereta, mãos ao lado do quadril.'
  },
  {
    id: '17',
    sanskritName: 'Paschimottanasana',
    portugueseName: 'Flexão Sentada',
    difficulty: 'Iniciante',
    category: 'Sentado',
    benefits: ['Calma', 'Alongamento', 'Introspecção'],
    media: { thumbnailUrl: getImg('Flexão Sentada'), videoEmbedUrl: getVideo() },
    durationDefault: 60,
    description: 'Sentado, incline-se à frente segurando os pés ou canelas.'
  },
  {
    id: '18',
    sanskritName: 'Janu Sirsasana',
    portugueseName: 'Cabeça no Joelho',
    difficulty: 'Iniciante',
    category: 'Sentado',
    benefits: ['Flexibilidade', 'Digestão', 'Calma'],
    media: { thumbnailUrl: getImg('Janu Sirsasana'), videoEmbedUrl: getVideo() },
    durationDefault: 45,
    description: 'Uma perna estendida, a outra dobrada com o pé na coxa interna. Incline-se sobre a perna estendida.'
  },
  {
    id: '19',
    sanskritName: 'Ardha Matsyendrasana',
    portugueseName: 'Torção Sentada',
    difficulty: 'Iniciante',
    category: 'Sentado',
    benefits: ['Coluna', 'Digestão', 'Energia'],
    media: { thumbnailUrl: getImg('Torção'), videoEmbedUrl: getVideo() },
    durationDefault: 45,
    description: 'Sentado, cruze uma perna sobre a outra e torça o tronco suavemente.'
  },
  {
    id: '20',
    sanskritName: 'Baddha Konasana',
    portugueseName: 'Postura da Borboleta',
    difficulty: 'Iniciante',
    category: 'Sentado',
    benefits: ['Abertura de Quadril', 'Circulação', 'Relaxamento'],
    media: { thumbnailUrl: getImg('Borboleta'), videoEmbedUrl: getVideo() },
    durationDefault: 60,
    description: 'Junte as solas dos pés e deixe os joelhos caírem para os lados.'
  },

  // INVERSÕES & BACKBENDS
  {
    id: '21',
    sanskritName: 'Setu Bandhasana',
    portugueseName: 'Postura da Ponte',
    difficulty: 'Iniciante',
    category: 'Inversão',
    benefits: ['Coluna', 'Peito', 'Tireoide'],
    media: { thumbnailUrl: getImg('Ponte'), videoEmbedUrl: getVideo() },
    durationDefault: 45,
    description: 'Deitado de costas, dobre os joelhos e eleve o quadril do chão.'
  },
  {
    id: '22',
    sanskritName: 'Bhujangasana',
    portugueseName: 'Postura da Cobra',
    difficulty: 'Iniciante',
    category: 'Restaurativa',
    benefits: ['Coluna', 'Peito', 'Pulmões'],
    media: { thumbnailUrl: getImg('Cobra'), videoEmbedUrl: getVideo() },
    durationDefault: 30,
    description: 'Deitado de bruços, coloque as mãos sob os ombros e eleve o peito suavemente.'
  },
  {
    id: '23',
    sanskritName: 'Ustrasana',
    portugueseName: 'Postura do Camelo',
    difficulty: 'Intermediário',
    category: 'Restaurativa',
    benefits: ['Energia', 'Abertura Frontal', 'Postura'],
    media: { thumbnailUrl: getImg('Camelo'), videoEmbedUrl: getVideo() },
    durationDefault: 30,
    description: 'Ajoelhado, incline-se para trás tentando alcançar os calcanhares.'
  },
  {
    id: '24',
    sanskritName: 'Salamba Sarvangasana',
    portugueseName: 'Vela',
    difficulty: 'Intermediário',
    category: 'Inversão',
    benefits: ['Circulação', 'Calma', 'Tireoide'],
    media: { thumbnailUrl: getImg('Vela'), videoEmbedUrl: getVideo() },
    durationDefault: 45,
    description: 'Deite-se e eleve as pernas e o quadril, apoiando as mãos nas costas.'
  },

  // RESTAURATIVA & FINALIZAÇÃO
  {
    id: '25',
    sanskritName: 'Supta Baddha Konasana',
    portugueseName: 'Borboleta Deitada',
    difficulty: 'Iniciante',
    category: 'Restaurativa',
    benefits: ['Relaxamento Profundo', 'Abertura Pélvica'],
    media: { thumbnailUrl: getImg('Borboleta Deitada'), videoEmbedUrl: getVideo() },
    durationDefault: 90,
    description: 'Deite-se de costas, junte os pés e deixe os joelhos caírem.'
  },
  {
    id: '26',
    sanskritName: 'Ananda Balasana',
    portugueseName: 'Bebê Feliz',
    difficulty: 'Iniciante',
    category: 'Restaurativa',
    benefits: ['Quadril', 'Coluna', 'Acalmar'],
    media: { thumbnailUrl: getImg('Bebê Feliz'), videoEmbedUrl: getVideo() },
    durationDefault: 60,
    description: 'Deitado, segure as bordas externas dos pés e traga os joelhos em direção às axilas.'
  },
  {
    id: '27',
    sanskritName: 'Viparita Karani',
    portugueseName: 'Pernas na Parede',
    difficulty: 'Iniciante',
    category: 'Restaurativa',
    benefits: ['Circulação', 'Descanso', 'Alívio de Pernas Cansadas'],
    media: { thumbnailUrl: getImg('Pernas Parede'), videoEmbedUrl: getVideo() },
    durationDefault: 120,
    description: 'Deite-se próximo a uma parede e estenda as pernas para cima apoiadas nela.'
  },
  {
    id: '28',
    sanskritName: 'Eka Pada Rajakapotasana',
    portugueseName: 'Pombo',
    difficulty: 'Intermediário',
    category: 'Restaurativa',
    benefits: ['Quadril Profundo', 'Emoções', 'Flexibilidade'],
    media: { thumbnailUrl: getImg('Pombo'), videoEmbedUrl: getVideo() },
    durationDefault: 60,
    description: 'Traga uma perna à frente dobrada e estenda a outra para trás.'
  },
  {
    id: '29',
    sanskritName: 'Matsyasana',
    portugueseName: 'Peixe',
    difficulty: 'Iniciante',
    category: 'Restaurativa',
    benefits: ['Peito', 'Garganta', 'Pescoço'],
    media: { thumbnailUrl: getImg('Peixe'), videoEmbedUrl: getVideo() },
    durationDefault: 30,
    description: 'Deitado de costas, apoie-se nos antebraços e arqueie o peito para cima.'
  },
  {
    id: '30',
    sanskritName: 'Savasana',
    portugueseName: 'Postura do Cadáver',
    difficulty: 'Iniciante',
    category: 'Finalização',
    benefits: ['Integração', 'Paz Total', 'Relaxamento'],
    media: { thumbnailUrl: getImg('Savasana'), videoEmbedUrl: getVideo() },
    durationDefault: 300,
    description: 'Deite-se de costas, braços e pernas relaxados, olhos fechados.'
  },
];