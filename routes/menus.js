const router = require("koa-router")();
const Menu = require("../models/menuSchema");
const util = require("../utils/util.js");

router.prefix("/menu");

// menu获取
router.get("/list", async (ctx) => {
  const { menuName, menuState } = ctx.request.query;
  const params = {};
  if (menuName) params.menuName = menuName;
  if (menuState) params.menuState = menuState;
  const rootList = (await Menu.find()) || [];
  let treeList = TreeMenu(rootList, null, []);
  let searchParentId = "";
  if (menuName) {
    const searchList = (await Menu.find(params)) || [];
    if (searchList.length) {
      searchParentId = findParentId(rootList, searchList[0]._doc);
      if (searchParentId) {
        treeList = treeList.filter(
          (item) => String(item._id) === String(searchParentId)
        );
      }
    } else {
      treeList = [];
    }
  }
  ctx.body = util.success(treeList);
});

function TreeMenu(rootList, id, list) {
  for (let i = 0; i < rootList.length; i++) {
    const arr = rootList[i].parentId.slice(0, 1);
    if ((!id && !arr.length) || (arr.length && String(arr[0]) === String(id))) {
      list.push(rootList[i]._doc);
    }
  }
  list.map((item) => {
    item.children = [];
    TreeMenu(rootList, item._id, item.children);
    if (!item.children.length) {
      delete item.children;
    } else if (item.children.length > 0 && item.children[0].menuType === 2) {
      item.action = item.children;
    }
  });
  return list;
}

// 找到最上层菜单id
function findParentId(rootList, listItem) {
  if (!listItem.parentId.length) {
    return listItem._id;
  }
  const parentId = listItem.parentId.slice(0, 1)[0];
  const item = rootList.filter((item) => String(item._id) === String(parentId));
  return findParentId(rootList, item[0]);
}

// menu增删改
router.post("/operate", async (ctx) => {
  const { _id, action, ...params } = ctx.request.body;
  let res, info;
  try {
    if (action === "add") {
      params.createTime = new Date();
      res = await Menu.create(params);
      info = "创建成功";
    } else if (action === "edit") {
      params.updateTime = new Date();
      res = await Menu.findByIdAndUpdate(_id, params);
      info = "修改成功";
    } else {
      res = await Menu.findByIdAndRemove(_id);
      await Menu.deleteMany({ parentId: { $all: [_id] } });
      info = "删除成功";
    }
    ctx.body = util.success("", info);
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});

module.exports = router;
