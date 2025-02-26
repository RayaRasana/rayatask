const Action = require("../../models/Action");

const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.user) && !_.isString(value.userId)) {
    return false;
  }

  if (!_.isPlainObject(value.action)) {
    return false;
  }

  return true;
};

// TODO: use templates (views) to build html
const buildAndSendEmail = async (board, card, action, actorUser, notifiableUser, taskIsComplete = true) => {
  let emailData;
  switch (action.type) {
    case Action.Types.MOVE_CARD:
      emailData = {
        subject: `${actorUser.name} کارت ${card.name} را از لیست ${action.data.fromList.name} به لیست ${action.data.toList.name} در برد ${board.name} انتقال داد.`,
        html:
          `<div style="width: calc(80% - 2px); height: 90%; border-radius: 10px; border:1px solid #999; margin: 5% 0%; padding: 20px 10% 10px 10%; background: linear-gradient(45deg,transparent 14%, #f2f2f2 15%,#f2f2f2  20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%),linear-gradient(135deg,transparent 14%, #f2f2f2 15%, #f2f2f2 20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%), radial-gradient(transparent 14%, #f2f2f2 15%, #f2f2f2 25%, transparent 26%); background-size: 1em 1em; background-color: #ffffff; opacity: 1;color: black; direction: rtl; text-align: right; font-size: 0.9rem;" >
          <p>${actorUser.name} moved `
          + `<a href="${process.env.BASE_URL}/cards/${card.id}">${card.name}</a> `
          + `from ${action.data.fromList.name} to ${action.data.toList.name} `
          + `on <a href="${process.env.BASE_URL}/boards/${board.id}">${board.name}</a></p>
          <span style="display: block; margin-top: 20px ;width: 100%; color: #777; font-size: 0.6rem; text-align: center;height:20px; line-height: 20px; text-decoration: none">برگرفته از توان <a style="color: rgb(68, 60, 168);" href="https://rayarasana.com">رایارسانا</a></span>
          </div>`,
      };

      break;
    case Action.Types.COMMENT_CARD:
      emailData = {
        subject: `${actorUser.name} نظر جدیدی در کارت ${card.name} در برد ${board.name} قرار داد.`,
        html:
          `<div style="width: calc(80% - 2px); height: 90%; border-radius: 10px; border:1px solid #999; margin: 5% 0%; padding: 20px 10% 10px 10%; background: linear-gradient(45deg,transparent 14%, #f2f2f2 15%,#f2f2f2  20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%),linear-gradient(135deg,transparent 14%, #f2f2f2 15%, #f2f2f2 20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%), radial-gradient(transparent 14%, #f2f2f2 15%, #f2f2f2 25%, transparent 26%); background-size: 1em 1em; background-color: #ffffff; opacity: 1;color: black; direction: rtl; text-align: right; font-size: 0.9rem;" >
          <p>${actorUser.name} نظر جدیدی بر روی کارت  `
          + `<a href="${process.env.BASE_URL}/cards/${card.id}">${card.name}</a> `
          + `در برد <a href="${process.env.BASE_URL}/boards/${board.id}">${board.name}</a> قرار داد.</p>`
          + `<p></p>
          <span style="display: block; margin-top: 20px ;width: 100%; color: #777; font-size: 0.6rem; text-align: center;height:20px; line-height: 20px; text-decoration: none">برگرفته از توان <a style="color: rgb(68, 60, 168);" href="https://rayarasana.com">رایارسانا</a></span>
          </div>`,
      };

      break;
    case Action.Types.CREATE_CARD:
      emailData = {
        subject: `${actorUser.name} کارت جدیدی با نام ${card.name} در ${board.name} ایجاد کرد.`,
        html:
          `<div style="width: calc(80% - 2px); height: 90%; border-radius: 10px; border:1px solid #999; margin: 5% 0%; padding: 20px 10% 10px 10%; background: linear-gradient(45deg,transparent 14%, #f2f2f2 15%,#f2f2f2  20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%),linear-gradient(135deg,transparent 14%, #f2f2f2 15%, #f2f2f2 20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%), radial-gradient(transparent 14%, #f2f2f2 15%, #f2f2f2 25%, transparent 26%); background-size: 1em 1em; background-color: #ffffff; opacity: 1;color: black; direction: rtl; text-align: right; font-size: 0.9rem;" >
          <p>${actorUser.name} کارت جدیدی با نام `
          + `<a href="${process.env.BASE_URL}/cards/${card.id}">${card.name}</a> در برد `
          + `on <a href="${process.env.BASE_URL}/boards/${board.id}">${board.name}</a>ایجاد کرد.</p>`
          + `<p></p>
          <span style="display: block; margin-top: 20px ;width: 100%; color: #777; font-size: 0.6rem; text-align: center;height:20px; line-height: 20px; text-decoration: none">برگرفته از توان <a style="color: rgb(68, 60, 168);" href="https://rayarasana.com">رایارسانا</a></span>
          </div>`,
      };
      break;
    case Action.Types.USER_TO_CARD_ADD:
      emailData = {
        subject: `${actorUser.name} به ${card.name} در ${board.name} اضافه شد.`,
        html:
          `<div style="width: calc(80% - 2px); height: 90%; border-radius: 10px; border:1px solid #999; margin: 5% 0%; padding: 20px 10% 10px 10%; background: linear-gradient(45deg,transparent 14%, #f2f2f2 15%,#f2f2f2  20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%),linear-gradient(135deg,transparent 14%, #f2f2f2 15%, #f2f2f2 20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%), radial-gradient(transparent 14%, #f2f2f2 15%, #f2f2f2 25%, transparent 26%); background-size: 1em 1em; background-color: #ffffff; opacity: 1;color: black; direction: rtl; text-align: right; font-size: 0.9rem;" >
          <p>${actorUser.name} به کارت `
          + `<a href="${process.env.BASE_URL}/cards/${card.id}">${card.name}</a> `
          + `در <a href="${process.env.BASE_URL}/boards/${board.id}">${board.name}</a> اضافه شد.</p>`
          + `<p></p>
          <span style="display: block; margin-top: 20px ;width: 100%; color: #777; font-size: 0.6rem; text-align: center;height:20px; line-height: 20px; text-decoration: none">برگرفته از توان <a style="color: rgb(68, 60, 168);" href="https://rayarasana.com">رایارسانا</a></span>
          </div>`,
      };
      break;
    case Action.Types.CREATE_TASK:
      emailData = {
        subject: `تسک ${action.data.taskName} اضافه شد.`,
        html:
          `<div style="width: calc(80% - 2px); height: 90%; border-radius: 10px; border:1px solid #999; margin: 5% 0%; padding: 20px 10% 10px 10%; background: linear-gradient(45deg,transparent 14%, #f2f2f2 15%,#f2f2f2  20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%),linear-gradient(135deg,transparent 14%, #f2f2f2 15%, #f2f2f2 20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%), radial-gradient(transparent 14%, #f2f2f2 15%, #f2f2f2 25%, transparent 26%); background-size: 1em 1em; background-color: #ffffff; opacity: 1;color: black; direction: rtl; text-align: right; font-size: 0.9rem;" >
          <p>${actorUser.name} تسک جدیدی را با عنوان ${action.data.taskName} بر روی کارت <a href="${process.env.BASE_URL}/cards/${card.id}">${card.name}</a> قرار داد.</p>
          <span style="display: block; margin-top: 20px ;width: 100%; color: #777; font-size: 0.6rem; text-align: center;height:20px; line-height: 20px; text-decoration: none">برگرفته از توان <a style="color: rgb(68, 60, 168);" href="https://rayarasana.com">رایارسانا</a></span>
          </div>`
          ,
      };
      break;
    case Action.Types.UPDATE_TASK:
      taskIsComplete ? (
      emailData = {
        subject: `${actorUser.name} تسک ${action.data.taskName} را به انجام شده تغییر داد.`,
        html: `<div style="width: calc(80% - 2px); height: 90%; border-radius: 10px; border:1px solid #999; margin: 5% 0%; padding: 20px 10% 10px 10%; background: linear-gradient(45deg,transparent 14%, #f2f2f2 15%,#f2f2f2  20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%),linear-gradient(135deg,transparent 14%, #f2f2f2 15%, #f2f2f2 20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%), radial-gradient(transparent 14%, #f2f2f2 15%, #f2f2f2 25%, transparent 26%); background-size: 1em 1em; background-color: #ffffff; opacity: 1;color: black; direction: rtl; text-align: right; font-size: 0.9rem;" >
                <p>وضعیت تسک <b>${action.data.taskName}</b> در کارت <a href="${process.env.BASE_URL}/cards/${card.id}">${card.name}</a> توسط <b>${actorUser.name}</b> به انجام شده تغییر پیدا کرد.</p>
                <span style="display: block; margin-top: 20px ;width: 100%; color: #777; font-size: 0.6rem; text-align: center;height:20px; line-height: 20px; text-decoration: none">برگرفته از توان <a style="color: rgb(68, 60, 168);" href="https://rayarasana.com">رایارسانا</a></span>
              </div>`,
      }
      ):(
        emailData = {
          subject: `${actorUser.name} وضعیت تسک ${action.data.taskName} را به انجام نشده تغییر داد.`,
          html: `<div style="width: calc(80% - 2px); height: 90%; border-radius: 10px; border:1px solid #999; margin: 5% 0%; padding: 20px 10% 10px 10%; background: linear-gradient(45deg,transparent 14%, #f2f2f2 15%,#f2f2f2  20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%),linear-gradient(135deg,transparent 14%, #f2f2f2 15%, #f2f2f2 20%, transparent 21%, transparent 79%, #f2f2f2  80%, #f2f2f2 85%, transparent 86%), radial-gradient(transparent 14%, #f2f2f2 15%, #f2f2f2 25%, transparent 26%); background-size: 1em 1em; background-color: #ffffff; opacity: 1;color: black; direction: rtl; text-align: right; font-size: 0.9rem;" >
                <p>وضعیت تسک <b>${action.data.taskName}</b> در کارت <a href="${process.env.BASE_URL}/cards/${card.id}">${card.name}</a> توسط <b>${actorUser.name}</b> به انجام نشده تغییر پیدا کرد.</p>
                <span style="display: block; margin-top: 20px ;width: 100%; color: #777; font-size: 0.6rem; text-align: center;height:20px; line-height: 20px; text-decoration: none">برگرفته از توان <a style="color: rgb(68, 60, 168);" href="https://rayarasana.com">رایارسانا</a></span>
              </div>`,
      })
      break;
    default:
      return;
  }

  await sails.helpers.utils.sendEmail.with({
    ...emailData,
    to: notifiableUser.email,
  });
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
    card: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { values } = inputs;
    let taskIsComplete = true;
    if (values.user) {
      values.userId = values.user.id;
    }

    const notification = await Notification.create({
      ...values,
      actionId: values.action.id,
      cardId: values.action.cardId,
    }).fetch();

    sails.sockets.broadcast(`user:${notification.userId}`, 'notificationCreate', {
      item: notification,
    });

    if (sails.hooks.smtp.isActive()) {
      let notifiableUser;
      if (values.user) {
        notifiableUser = values.user;
      } else {
        notifiableUser = await sails.helpers.users.getOne(notification.userId);
      }
      if (values.action.type === Action.Types.UPDATE_TASK){
        taskIsComplete = inputs.values.values.record.isCompleted;
      }
      buildAndSendEmail(inputs.board, inputs.card, values.action, inputs.actorUser, notifiableUser, taskIsComplete);
    }

    sails.helpers.utils.sendWebhooks.with({
      event: 'notificationCreate',
      data: {
        item: notification,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [inputs.card],
          actions: [values.action],
        },
      },
      user: inputs.actorUser,
    });

    return notification;
  },
};
