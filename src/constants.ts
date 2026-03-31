


export const BRAND = {
  name: 'Easy Byz Creator',
  logo: 'https://i.ibb.co/84fBL30r/patitour-43.png',
  contractLogo: 'https://i.ibb.co/ksMcNpGv/patitour-77.png',
  colors: {
    green: '#00E6A8',
    blue: '#00CFFF',
    white: '#FFFFFF',
    dark: '#0A1E29',
  }
};

export const SERVICES = [
  'Easy agenda',
  'Easy menu',
  'Easy agenda BR',
  'Easy menu BR',
  'SITE EUA',
  'SITE BR'
];

export const PERSONALIZED_SERVICES = [
  'Easy beauty',
  'Easy clean',
  'Easy media',
  'Easy therapy',
  'Easy pet',
  'Easy home services',
  'Easy kitchen',
  'Easy tutor',
  'Easy events',
  'Easy fitness',
  'Easy house manager',
  'OUTRO (ESPECIFICAR)',
  'CONTRATO VAZIO'
];

export const DEFAULT_INSTRUCTIONS_STANDARD = `Para que a Easy Byz Creator inicie a personalização do seu sistema, o CONTRATANTE deverá seguir rigorosamente as etapas abaixo:
1. Envio de Comprovante e Material: Após realizar o pagamento inicial (Setup + 1ª Mensalidade), o cliente deve enviar um e-mail para contato@easybyzcreator.com, obrigatoriamente com cópia para contato.easybyzcreator@gmail.com, contendo:
   - O comprovante de pagamento anexo;
   - O arquivo em PDF ou imagem de alta qualidade do menu/cardápio a ser configurado.
2. Confirmação de Recebimento: O fluxo de trabalho será iniciado apenas após a Easy Byz Creator enviar um e-mail de resposta confirmando o recebimento integral dos documentos e do pagamento.
3. Etapa de Layout e WhatsApp: Após a confirmação, a CONTRATADA desenvolverá uma prévia do layout. Assim que estiver pronta, nossa equipe entrará em contato diretamente via WhatsApp para apresentar a prévia e dar sequência aos ajustes finais e publicação.
4. Contagem do Prazo: O prazo de entrega de até 15 (quinze) dias úteis começa a ser contabilizado a partir da data de confirmação do recebimento do pagamento e do menu por e-mail.
Nota Importante: A ausência de qualquer um dos documentos (comprovante ou menu) ou o envio para e-mails diferentes dos citados acima desobriga a CONTRATADA do cumprimento do prazo de entrega, que passará a contar apenas após a regularização da pendência.`;

export const DEFAULT_INSTRUCTIONS_PERSONALIZED = `Para que a Easy Byz Creator inicie a personalização do seu sistema, o CONTRATANTE deverá seguir rigorosamente as etapas abaixo:
1. Envio de Comprovante e Material: Após realizar o pagamento inicial (Setup + 1ª Mensalidade), o cliente deve enviar um e-mail para contato@easybyzcreator.com, obrigatoriamente com cópia para contato.easybyzcreator@gmail.com, contendo:
   - O comprovante de pagamento anexo;
   - O arquivo em PDF ou imagem de alta qualidade do projeto/serviço a ser configurado.
2. Confirmação de Recebimento: O fluxo de trabalho será iniciado apenas após a Easy Byz Creator enviar um e-mail de resposta confirmando o recebimento integral dos documentos e do pagamento.
3. Etapa de Layout e WhatsApp: Após a confirmação, a CONTRATADA desenvolverá uma prévia do layout. Assim que estiver pronta, nossa equipe entrará em contato diretamente via WhatsApp para apresentar a prévia e dar sequência aos ajustes finais e publicação.
4. Contagem do Prazo: O prazo de entrega de até 30 (trinta) dias úteis começa a ser contabilizado a partir da data de confirmação do recebimento do pagamento e do material por e-mail.
Nota Importante: A ausência de qualquer um dos documentos (comprovante ou material) ou o envio para e-mails diferentes dos citados acima desobriga a CONTRATADA do cumprimento do prazo de entrega, que passará a contar apenas após a regularização da pendência.`;

export const CONTRACT_TEMPLATE = {
  title: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS',
  clauses: [
    {
      id: 1,
      title: 'DO OBJETO',
      content: 'O presente contrato tem por objeto a licença de uso da plataforma [SERVICE_NAME] e a prestação de serviço de configuração personalizada (Setup) pela CONTRATADA em favor do CONTRATANTE.'
    },
    {
      id: 2,
      title: 'DO FLUXO DE TRABALHO E PRAZO DE ENTREGA',
      content: 'Para o início da configuração, o CONTRATANTE deverá: a) Efetuar o pagamento da Taxa de Setup e/ou da primeira parcela da assinatura; b) Enviar os dados e materiais necessários para personalização. Prazo: A CONTRATADA entregará o sistema configurado e pronto para uso em até 15 (quinze) dias úteis.'
    },
    {
      id: 3,
      title: 'DOS VALORES E PLANOS',
      content: 'O CONTRATANTE opta pelo plano selecionado no ato da assinatura. A Taxa de Setup destina-se exclusivamente à remuneração do trabalho manual de personalização.'
    },
    {
      id: 4,
      title: 'DA VIGÊNCIA E RESCISÃO',
      content: '4.1. O presente contrato tem vigência de 12 (doze) meses, contados a partir da data de assinatura, sendo renovado automaticamente por igual período, salvo manifestação em contrário por escrito com 30 dias de antecedência.\n4.2. Por tratar-se de um plano anual parcelado, em caso de cancelamento antecipado por iniciativa do CONTRATANTE antes do término dos 12 meses, este obriga-se ao pagamento integral das parcelas remanescentes até o final do período contratado, não havendo devolução de valores por serviços já configurados (Setup).'
    },
    {
      id: 5,
      title: 'DOS PAGAMENTOS VIA ZELLE/VENMO',
      content: 'O sistema atua como um facilitador visual. A transação financeira ocorre fora da plataforma (Peer-to-Peer). A CONTRATADA não processa pagamentos e não valida a entrada de valores em conta.'
    },
    {
      id: 6,
      title: 'DAS FUNCIONALIDADES E ESPECIFICAÇÕES DO SISTEMA',
      content: 'A plataforma Easy Byz consiste em uma solução de infraestrutura digital interativa, cujas especificações são:\n\n6.1. Entrega da Estrutura Funcional: A CONTRATADA preparará e configurará o layout do sistema com base nos materiais enviados, criando a interface necessária para que o sistema seja funcional.\n\n6.2. Responsabilidade pela Alimentação de Dados e Configurações: O CONTRATANTE reconhece que é o único responsável por realizar, através do painel administrativo:\n- O preenchimento, cadastro e manutenção de todos os itens do sistema (textos, preços e fotos);\n- A configuração e inserção de suas chaves de recebimento (Zelle, Venmo ou similares);\n- A inserção e atualização do número de WhatsApp que receberá as notificações.\nA CONTRATADA não realiza o serviço de digitação de itens ou configuração de dados privados de recebimento.\n\n6.3. Link Personalizado e Hospedagem:\n- Cada cliente terá um link exclusivo e personalizado para seu negócio.\n- O sistema será hospedado em infraestrutura de alta performance. A manutenção deste link ativo está estritamente vinculada à pontualidade do pagamento da mensalidade.\n\n6.4. Ferramentas Administrativas para o Usuário:\n- Autonomia de Gestão: O CONTRATANTE terá acesso a um painel para gerenciar produtos/serviços em tempo real.\n- Histórico de Pedidos: Acesso aos registros de vendas e banco de dados dos consumidores que utilizaram o sistema.\n\n6.5. Fluxo de Fechamento de Pedido:\n- O sistema consolidará o pedido e gerará uma mensagem automática estruturada para o WhatsApp configurado pelo CONTRATANTE.'
    },
    {
      id: 7,
      title: 'PRIVACIDADE E DADOS DE TERCEIROS',
      content: '7.1. A CONTRATADA fornece a infraestrutura tecnológica, mas não acessa, utiliza ou comercializa os dados dos consumidores finais coletados pelo link de vendas.\n7.2. O CONTRATANTE é o único controlador e responsável pelo tratamento de dados e pela segurança das informações de seus clientes.'
    },
    {
      id: 8,
      title: 'LIMITAÇÃO DE RESPONSABILIDADE',
      content: '8.1. A CONTRATADA não se responsabiliza por: (i) interrupções de serviço de internet ou energia do cliente; (ii) falhas técnicas nos aplicativos Zelle, Venmo ou similares; (iii) erros cometidos pelo CONTRATANTE no painel administrativo.'
    },
    {
      id: 9,
      title: 'FORO',
      content: '9.1. Para dirimir quaisquer questões oriundas deste contrato, as partes elegem o foro da comarca de Santa Ana, CA - EUA.'
    }
  ]
};
