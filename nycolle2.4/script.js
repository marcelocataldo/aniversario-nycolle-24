import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDMtMsEp0eXYvITiSTn7pBqvKwlFIHNQ78",
    authDomain: "nycolle24bd.firebaseapp.com",
    databaseURL: "https://nycolle24bd-default-rtdb.firebaseio.com",
    projectId: "nycolle24bd",
    storageBucket: "nycolle24bd.appspot.com",
    messagingSenderId: "52286560042",
    appId: "1:52286560042:web:62a1239f841ff11beeb053",
    measurementId: "G-J7TYPXRFL1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("Firebase inicializado:", app.name);

let convidadoAtual = null;
let indexAtual = 0;
let pontuacao = 0;
let quizConcluido = false;

const perguntas = [
  {
    pergunta: "1. Série favorita?", alternativas: {
      a: "Grey's Anatomy",
      b: "Breaking bad",
      c: "Sherlock"
    },
    correta: "c"
  },
  {
    pergunta: "2. O que eu pediria se tivesse que pedir o mesmo lanche todo dia?", alternativas: {
      a: "Pizza",
      b: "Comida japonesa",
      c: "Batata frita"
    },
    correta: "b"
  },
  {
    pergunta: "3. Quanto eu calço?", alternativas: {
      a: "39",
      b: "40",
      c: "41"
    },
    correta: "b"
  },
  {
    pergunta: "4. Quantas tatuagens tenho?", alternativas: {
      a: "10",
      b: "11",
      c: "12"
    },
    correta: "b"
  },
  {
    pergunta: "5. Qual comida eu odeio mas todo mundo ama?", alternativas: {
      a: "Hambúrguer",
      b: "Comida árabe",
      c: "Lasanha"
    },
    correta: "a"
  },
  {
    pergunta: "6. Qual filme eu assistiria todos os dias da minha vida?", alternativas: {
      a: "Como perder um homem em 10 dias",
      b: "Enrolados",
      c: "Harry Potter"
    },
    correta: "b"
  },
  {
    pergunta: "7. Qual motivo da cicatriz no meu rosto?", alternativas: {
      a: "Caí da bicicleta",
      b: "Meu irmão me machucou",
      c: "Meu cachorro me mordeu"
    },
    correta: "c"
  },
  {
    pergunta: "8. Qual lugar sonho em conhecer?", alternativas: {
      a: "Itália",
      b: "Disney",
      c: "Paris"
    },
    correta: "a"
  },
  {
    pergunta: "9. Um vício:", alternativas: {
      a: "Mexer no cachinho",
      b: "Nescau todo dia de manhã",
      c: "Roer a unha"
    },
    correta: "b"
  },
  {
    pergunta: "10. Qual minha bebida favorita?", alternativas: {
      a: "Aperol",
      b: "Cerveja",
      c: "Caipirinha"
    },
    correta: "b"
  },
];

function formatarTelefone(telefone) {
  const numeros = telefone.replace(/\D/g, '');
  if (numeros.length === 10 || numeros.length === 11) {
    return numeros;
  }
  
  return null;
}

async function verificarConvidado() {
  const telefoneInput = document.getElementById('loginInputField').value.trim();
  const telefoneFormatado = formatarTelefone(telefoneInput);
  
  console.log('[DEBUG] Telefone digitado:', telefoneInput);
  console.log('[DEBUG] Telefone formatado:', telefoneFormatado);

  if (!telefoneFormatado) {
    console.warn('[DEBUG] Telefone inválido');
    alert("Por favor, insira um número válido com DDD (ex: 21 98765-4321)");
    return;
  }

  try {
    const convidadoRef = doc(db, "convidados", telefoneFormatado);
    console.log('[DEBUG] Caminho do documento:', convidadoRef.path);
    
    const convidadoDoc = await getDoc(convidadoRef);
    console.log('[DEBUG] Documento existe?', convidadoDoc.exists());
    console.log('[DEBUG] Dados do documento:', convidadoDoc.data());

    if (convidadoDoc.exists()) {
      convidadoAtual = {
        telefone: telefoneFormatado,
        nome: convidadoDoc.data().nome
      };
      
      console.log('[DEBUG] Convidado encontrado:', convidadoAtual);
      document.getElementById('nomeGuest').textContent = convidadoDoc.data().nome;
      mostrarTela('guest');
    } else {
      console.warn('[DEBUG] Convidado não encontrado');
      alert("Telefone não encontrado. Verifique o número digitado.");
    }
  } catch (error) {
    console.error('[DEBUG] Erro completo:', error);
    alert("Erro de conexão. Verifique console para detalhes.");
  }
}

async function salvarPontuacao() {
  try {
    await addDoc(collection(db, "pontuacoes"), {
      nome: convidadoAtual.nome,
      telefone: convidadoAtual.telefone,
      pontos: pontuacao,
      data: new Date()
    });

    await mostrarLeaderboard();  
  } catch (error) {
    console.error("Erro ao salvar pontuação:", error);
  }
}

async function mostrarLeaderboard() {
  try {
    const q = query(
      collection(db, "pontuacoes"),
      orderBy("pontos", "desc"),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    let leaderboardHTML = "<h2>Top 10</h2><ol>";
    
    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      leaderboardHTML += `<li><strong>${data.nome}:</strong> ${data.pontos} ponto${data.pontos !== 1 ? 's' : ''}</li>`;
    });
    
    leaderboardHTML += `</ol><p><strong>Sua pontuação:</strong> ${pontuacao}</p>`;
    leaderboardHTML += `</ol><p><strong>Atenção! </strong> Apenas o seu primeiro resultado será levado em considerção!</p>`;
    
    const leaderboard = document.createElement('div');
    leaderboard.id = 'leaderboard';
    leaderboard.classList.add('fade-in');
    leaderboard.innerHTML = leaderboardHTML;

    const voltarBtn = document.createElement('button');
    voltarBtn.id = 'voltarGuest';
    voltarBtn.textContent = 'Voltar';
    voltarBtn.addEventListener('click', () => {
      document.getElementById('quizz').style.display = "none";
      document.getElementById('leaderboard').remove();
      mostrarTela('guest');
      quizConcluido = true;
      
      const banner = document.getElementById('bannerQuizz');
      banner.innerHTML = '<h2>Ver Leaderboard</h2><p>Confira as melhores pontuações!</p>';
      banner.onclick = () => {
        document.getElementById('guest').style.display = "none";
        document.body.appendChild(leaderboard);
        document.getElementById('leaderboard').style.display = "block";
      };
    });

    leaderboard.appendChild(voltarBtn);
    
    document.getElementById('quizz').style.display = "none";
    document.body.appendChild(leaderboard);
    document.getElementById('leaderboard').style.display = "block";
    
  } catch (error) {
    console.error("Erro ao carregar leaderboard:", error);
    alert(`Sua pontuação: ${pontuacao}\n\nO leaderboard não pôde ser carregado.`);
    document.getElementById('quizz').style.display = "none";
    mostrarTela('guest');
    quizConcluido = true;
  }
}

function mostrarTela(idTela) {
  const telas = ['login', 'guest', 'quizz'];
  
  telas.forEach(tela => {
    const elemento = document.getElementById(tela);
    if (tela === idTela) {
      elemento.style.display = "flex";
      elemento.classList.remove('fade-out');
      elemento.classList.add('fade-in');
    } else if (elemento.style.display !== "none") {
      elemento.classList.remove('fade-in');
      elemento.classList.add('fade-out');
      
      // Quando a animação de fade out terminar, esconde o elemento
      elemento.addEventListener('animationend', function handler() {
        if (elemento.classList.contains('fade-out')) {
          elemento.style.display = "none";
          elemento.classList.remove('fade-out');
          elemento.removeEventListener('animationend', handler);
        }
      });
    }
  });
}

function mostrarQuizz() {
  if (quizConcluido) {
    document.getElementById('guest').style.display = "none";
    document.body.appendChild(document.getElementById('leaderboard'));
    document.getElementById('leaderboard').style.display = "block";
    return;
  }
  
  mostrarTela('quizz');
  indexAtual = 0;
  pontuacao = 0;
  mostrarPergunta();
}

function mostrarPergunta() {
  const atual = perguntas[indexAtual];
  document.getElementById("textoPergunta").textContent = atual.pergunta;
  document.getElementById("alternativaA").textContent = atual.alternativas.a;
  document.getElementById("alternativaB").textContent = atual.alternativas.b;
  document.getElementById("alternativaC").textContent = atual.alternativas.c;
}

function responder(alternativa) {
  const certa = perguntas[indexAtual].correta;
  const acertou = alternativa === certa;

  if (acertou) {
    pontuacao++;
  }

  indexAtual++;

  if (indexAtual < perguntas.length) {
    mostrarPergunta();
  } else {
    salvarPontuacao();
    const quizzDiv = document.getElementById('quizz');
    quizzDiv.classList.add('fade-out');
  
      quizzDiv.addEventListener('animationend', function handler() {
      quizzDiv.classList.remove('fade-out');
      quizzDiv.removeEventListener('animationend', handler);
    });
  }
  
}

document.addEventListener('DOMContentLoaded', () => {
  VANTA.FOG({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    highlightColor: 0xffd700,
    midtoneColor: 0xe6c200,
    lowlightColor: 0xb8860b,
    baseColor: 0xffffff,
    blurFactor: 0.3,
    speed: 0.6,
    zoom: 0.5
  });

  document.getElementById('verificarUser').addEventListener('click', verificarConvidado);
  document.getElementById('bannerQuizz').addEventListener('click', mostrarLeaderboard);
  
  document.querySelectorAll('.altBtn').forEach(btn => {
    btn.addEventListener('click', function() {
      const letra = this.id.replace('alternativa', '').toLowerCase();
      responder(letra);
    });
  });
  
  document.getElementById('loginInputField').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      verificarConvidado();
    }
  });
});
