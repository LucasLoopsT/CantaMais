<div align="center">
  
# 🎤 Canta Mais — Sistema de Restaurante com Karaokê
</div>

<div align="center">
  <img 
    src="https://github.com/LucasLoopsT/CantaMais/blob/master/src/assets/previewHome.png?raw=true" 
    alt="Canta Mais Preview" 
    width="100%" 
    height="100%" 
    style="object-fit: cover; object-position: center;"
  />

  <br/>

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

  <p align="center">
    <b>Sistema web interativo para restaurantes com pedidos em tempo real e integração de karaokê.</b>
  </p>

  <p align="center">
    <a href="https://lucasloopst.github.io/CantaMais/">🌐 Deploy</a>
  </p>
</div>

---

## 📌 Visão Geral

O **Canta Mais** é uma plataforma digital desenvolvida para transformar a experiência em restaurantes, unindo **gestão de pedidos** com **entretenimento via karaokê**.

O sistema permite que clientes façam pedidos diretamente pela comanda, enquanto a equipe gerencia tudo em tempo real — desde a cozinha até o controle das músicas exibidas no telão.

A aplicação foi pensada para ser **rápida, intuitiva e escalável**, oferecendo uma experiência moderna tanto para clientes quanto para funcionários.

> ⚠️ **Observação:** O backend do projeto está atualmente em desenvolvimento.  
> A versão atual utiliza dados mockados para simulação das funcionalidades.

---

## 🧱 Arquitetura do Projeto

O projeto segue uma arquitetura modular baseada em frontend, com separação clara de responsabilidades entre as interfaces:

| Módulo | Responsabilidade |
|--------|------------------|
| **Cliente** | Cardápio, carrinho, envio de pedidos e seleção de músicas |
| **Cozinha** | Recebimento de pedidos (simulado) e controle de preparo |
| **Mesas & Comandas** | Gerenciamento de mesas, comandas, pessoas e status |
| **Karaokê** | Fila de músicas, controle de execução e reprodução |
| **Admin** | Dashboard, autenticação e controle geral do sistema |

---

## 🚀 Funcionalidades

### 🍽️ Pedidos
- Criação de pedidos via comanda  
- Adição de produtos e extras  
- Cálculo automático de total  
- Simulação de envio para cozinha  

### 👨‍🍳 Cozinha
- Visualização de pedidos em tempo real (mock)  
- Detalhamento de itens e adicionais  
- Controle de status (preparando / pronto)  

### 🧾 Mesas & Comandas
- Gerenciamento de comandas  
- Associação de comandas às mesas  
- Controle de quantidade de pessoas  
- Controle de músicas disponíveis por mesa  

### 🎤 Karaokê
- Busca de músicas (JSON/API planejado)  
- Fila de execução  
- Controle de status (Aguardando / Cantando / Cantou)  
- Reprodução via YouTube (iframe)  

### 🛠️ Administrativo
- Login de funcionários (mock)  
- Dashboard com navegação lateral  
- Controle completo do sistema  

---

## 🎯 Diferenciais

- 🎵 Integração de karaokê com pedidos  
- ⚡ Interface rápida e responsiva  
- 🧠 Arquitetura preparada para tempo real (WebSocket-ready)  
- 💸 Estratégia híbrida para busca de músicas (JSON + API)  
- 🎨 UI moderna baseada em glassmorphism  

---

## 🧪 Acesso de Teste

Acesse a rota: https://lucasloopst.github.io/CantaMais/#/login

E logue com as credenciais de **Funcionário**
- Email: `teste@gmail.com`  
- Senha: `teste123`  

---

## 📌 Roadmap

- [ ] Desenvolvimento do backend  
- [ ] Integração com API real  
- [ ] WebSocket para tempo real  
- [ ] Cache inteligente de músicas  
- [ ] Player automático de karaokê  
- [ ] Sistema de pagamento integrado  

---

## ☁️ Infraestrutura (Planejada)

- Frontend: Vercel / GitHub Pages  
- Backend: Node.js + TypeScript  
- Banco: MongoDB  
- Tempo real: WebSocket  

---

## 💬 Considerações

Este projeto foi desenvolvido com foco em **experiência do usuário e escalabilidade**, podendo ser evoluído para um sistema completo de gestão para restaurantes com entretenimento integrado.

---
