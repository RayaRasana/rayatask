const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.user)) {
    return false;
  }

  return true;
};

const truncateString = (string, maxLength = 30) => (string.length > maxLength ? `${string.substring(0, 30)}...` : string);

const buildAndSendMarkdownMessage = async (card, action, actorUser, send) => {
  const cardLink = `<${sails.config.custom.baseUrl}/cards/${card.id}|${card.name}>`;
  // console.log(action);
  let markdown;
  switch (action.type) {
    case Action.Types.CREATE_CARD:
      markdown = `${cardLink} was created by ${actorUser.name} in *${action.data.list.name}*`;

      break;
    case Action.Types.MOVE_CARD:
      markdown = `${cardLink} was moved by ${actorUser.name} to *${action.data.toList.name}*`;

      break;
    case Action.Types.COMMENT_CARD:
      // TODO: truncate text?
      markdown = `*${actorUser.name}* commented on ${cardLink}:\n>${action.data.text}`;

      break;
    case Action.Types.USER_TO_CARD_ADD:
      markdown = `New Task ${actorUser.name} ${cardLink}`;

      break;
    case Action.Types.CREATE_TASK:
      markdown = `New task titled has been created by ${actorUser.name} ${cardLink}`;

      break;
    case Action.Types.UPDATE_TASK:
      markdown = `Task titled </b>task title</b> status has been set to done by ${actorUser.name} in ${cardLink}`;

      break;
    default:
      return;
  }

  await send(markdown);
};

const buildAndSendHtmlMessage = async (card, action, actorUser, send) => {
  const cardLink = `<a href="${sails.config.custom.baseUrl}/cards/${card.id}">${card.name}</a>`;

  let html;
  switch (action.type) {
    case Action.Types.CREATE_CARD:
      html = `${cardLink} was created by ${actorUser.name} in <b>${action.data.list.name}</b>`;

      break;
    case Action.Types.MOVE_CARD:
      html = `${cardLink} was moved by ${actorUser.name} to <b>${action.data.toList.name}</b>`;

      break;
    case Action.Types.COMMENT_CARD:
      html = `<b>${actorUser.name}</b> commented on ${cardLink}:\n<i>${truncateString(action.data.text)}</i>`;

      break;

    case Action.Types.USER_TO_CARD_ADD:
      html = `<b>${actorUser.name}</b> has been assigned to <b>${cardLink}</b>`;

      break;

    case Action.Types.CREATE_TASK:
      html = `A new task has been created in ${cardLink}</b>`;

      break;
    case Action.Types.UPDATE_TASK:
      html = `Task titled </b>task title</b> status has been set to done by ${actorUser.name} in ${cardLink}`;
  
        break;
    default:
      return;
  }

  await send(html);
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;
    // console.log(inputs.values);
    const action = await Action.create({
      ...values,
      cardId: values.card.id,
      userId: values.user.id,
    }).fetch();

    // console.log(action);
    sails.sockets.broadcast(
      `board:${values.card.boardId}`,
      'actionCreate',
      {
        item: action,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'actionCreate',
      data: {
        item: action,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      },
      user: values.user,
    });

    const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(
      action.cardId,
      action.userId,
    );
    
    if (inputs.values.type === "userToCardAdd") {
      subscriptionUserIds.push(inputs.values.user.id);
    }

    if (inputs.values.type === "updateTask") {
      await Promise.all(
        subscriptionUserIds.map(async (userId) => sails.helpers.notifications.createOne.with({
          values: {
            userId,
            action,
            values,
          },
          project: inputs.project,
          board: inputs.board,
          list: inputs.list,
          card: values.card,
          actorUser: values.user,

        })),
      ); 
    } else {
    
      await Promise.all(
        subscriptionUserIds.map(async (userId) => sails.helpers.notifications.createOne.with({
          values: {
            userId,
            action,
          },
          project: inputs.project,
          board: inputs.board,
          list: inputs.list,
          card: values.card,
          actorUser: values.user,
        })),
      );

    }
    if (sails.config.custom.slackBotToken) {
      buildAndSendMarkdownMessage(
        values.card,
        action,
        values.user,
        sails.helpers.utils.sendSlackMessage,
      );
    }

    if (sails.config.custom.googleChatWebhookUrl) {
      buildAndSendMarkdownMessage(
        values.card,
        action,
        values.user,
        sails.helpers.utils.sendGoogleChatMessage,
      );
    }

    if (sails.config.custom.telegramBotToken) {
      buildAndSendHtmlMessage(
        values.card,
        action,
        values.user,
        sails.helpers.utils.sendTelegramMessage,
      );
    }

    return action;
  },
};
