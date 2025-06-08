# Aplicativo de Evacuação e Rotas Seguras - Interface Front-end 📱

Bem-vindo ao repositório da Interface Front-end do nosso Aplicativo de Evacuação e Rotas Seguras! Este projeto foi construído com Next.js e TypeScript para ser a "cara" da nossa solução, oferecendo aos usuários uma forma clara e interativa de acessar informações cruciais em momentos de necessidade.

## Desenvolvedores

* **Gustavo** - RM: 561055
* **Arthur** - RM: 560820

## Sobre Esta Interface

No desenvolvimento desta interface, nosso principal objetivo foi criar uma experiência de usuário intuitiva e eficiente. Queremos que, mesmo sob a pressão de uma situação de emergência, qualquer pessoa consiga navegar pelas informações, entender os alertas, localizar abrigos e obter os dados necessários para sua segurança. O design foi pensado para ser limpo, responsivo e acessível.

## Funcionalidades Implementadas

Atualmente, nossa interface permite:

* **Visualizar Dados da API:**
    * Listagem de Alertas Atuais (`/alertas`)
    * Listagem de Abrigos Seguros Disponíveis (`/abrigos-seguros`)
    * Listagem de Áreas de Risco Identificadas (`/areas-de-risco`)
    * Listagem de Ocorrências Registradas (`/ocorrencias`)
    * Listagem de Campanhas (`/campanhas`)
    * Listagem de Relatos de Usuários (`/relatos`)
* **Gerenciamento Completo (CRUD) para Entidades Chave:**
    * **Alertas:** Criar, visualizar, editar e excluir.
    * **Abrigos Seguros:** Criar, visualizar, editar e excluir.
    * **Áreas de Risco:** Criar, visualizar, editar e excluir.
    * **Ocorrências:** Criar, visualizar, editar e excluir.
    * **Relatos:** Criar, visualizar, editar e excluir.
    * **Campanhas:** visualizar.
* **Navegação Principal:** A partir da Home page (`/`) para todas as seções listadas.
* **Página "Sobre a Equipe"** (`/integrantes`): Apresenta os desenvolvedores do projeto.

## Tecnologias Utilizadas

* **Next.js:** Framework React robusto para desenvolvimento de aplicações web.
* **React:** Biblioteca JavaScript fundamental para a construção de nossas interfaces de usuário.
* **TypeScript:** Para adicionar tipagem estática ao JavaScript, aumentando a segurança e manutenibilidade do código.
* **Next.js App Router:** Utilizamos o novo sistema de roteamento baseado em diretórios para uma navegação otimizada e Server Components para busca inicial de dados.
* **CSS Modules & CSS Global:** Para estilização escopada por componente e estilos base para toda a aplicação.
* **Fetch API:** Para consumir os dados da nossa API Back-end Java Quarkus.

* ## Deployment (Front-end na Nuvem)

* O deployment desta interface está planejado para a plataforma **Vercel**.
* Quando o deploy for realizado, a variável de ambiente `NEXT_PUBLIC_API_URL` será configurada diretamente na Vercel para apontar para a URL da API back-end em produção no Railway.
* (A URL de produção do front-end será adicionada aqui após o deploy bem-sucedido na Vercel).
