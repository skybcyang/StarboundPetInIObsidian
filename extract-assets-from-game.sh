#!/bin/bash

# 从饥荒游戏文件提取素材
# 适用于已购买正版游戏的用户

echo "=========================================="
echo "  饥荒素材提取脚本"
echo "=========================================="
echo ""
echo "此脚本帮助你从已购买的饥荒游戏中提取素材"
echo ""

# 检查操作系统
OS="$(uname -s)"

# Steam 安装路径
if [[ "$OS" == "Darwin" ]]; then
    # macOS
    STEAM_PATH="$HOME/Library/Application Support/Steam/steamapps/common/Don't Starve Together/dontstarve_steam.app/Contents"
    echo "检测到 macOS 系统"
elif [[ "$OS" == "Linux" ]]; then
    # Linux
    STEAM_PATH="$HOME/.steam/steam/steamapps/common/Don't Starve Together"
    echo "检测到 Linux 系统"
else
    # Windows (通过 WSL 或其他方式)
    STEAM_PATH="/mnt/c/Program Files (x86)/Steam/steamapps/common/Don't Starve Together"
    echo "尝试使用 Windows 路径"
fi

echo ""
echo "Steam 游戏路径: $STEAM_PATH"
echo ""

# 检查游戏是否存在
if [ ! -d "$STEAM_PATH" ]; then
    echo "❌ 未找到饥荒游戏安装目录"
    echo ""
    echo "请手动指定游戏路径："
    echo "  1. 打开 Steam 库"
    echo "  2. 右键 Don't Starve Together"
    echo "  3. 属性 → 本地文件 → 浏览"
    echo "  4. 复制路径并修改此脚本中的 STEAM_PATH"
    echo ""
    exit 1
fi

echo "✅ 找到游戏安装目录"
echo ""

# 创建素材目录
ASSETS_DIR="$(dirname "$0")/assets/dst"
mkdir -p "$ASSETS_DIR"

echo "素材输出目录: $ASSETS_DIR"
echo ""

# 注意：饥荒游戏资源是加密的，需要使用特定工具解包
echo "⚠️  重要提示："
echo "饥荒游戏资源经过打包和加密，需要使用专门的工具解包。"
echo ""
echo "推荐的工具："
echo "  1. ktools - https://github.com/nskime/ktools"
echo "  2. dont-starve-mod-tools - Klei 官方工具"
echo "  3. 手动从游戏截图/使用现有素材"
echo ""

# 检查是否存在已解包的资源
ANIM_PATH="$STEAM_PATH/data/anim"

if [ -d "$ANIM_PATH" ]; then
    echo "✅ 找到动画资源目录"
    echo ""
    echo "你可以使用以下工具解包："
    echo ""
    echo "## 使用 ktools (推荐)"
    echo ""
    echo "1. 安装 ktools:"
    echo "   git clone https://github.com/nskime/ktools"
    echo "   cd ktools"
    echo "   make"
    echo ""
    echo "2. 解包资源:"
    echo "   ./ktech $ANIM_PATH/spider.zip spider.png"
    echo ""
    echo "或者直接使用自动化脚本..."
    echo ""
else
    echo "⚠️  未找到动画资源目录"
    echo "游戏可能使用了不同的资源格式"
fi

echo ""
echo "=========================================="
echo "替代方案：下载免费同人素材"
echo "=========================================="
echo ""
echo "如果不想解包游戏文件，可以使用以下免费资源："
echo ""
echo "1. 访问: https://www.spriters-resource.com/pc_computer/dontstarve/"
echo "   这是一个游戏素材资源站，提供多种游戏的精灵图"
echo ""
echo "2. 搜索关键词: 'dont starve sprite sheet'"
echo ""
echo "3. 使用 AI 生成类似风格的素材"
echo ""

# 创建占位文件提示用户
cat > "$ASSETS_DIR/INSTRUCTIONS.txt" << 'EOF'
饥荒素材提取说明
==================

你有以下几种方式获取素材：

方法1：从游戏文件提取（推荐）
--------------------------------
1. 安装 ktools:
   git clone https://github.com/nskime/ktools
   cd ktools && make

2. 找到游戏资源目录:
   macOS: ~/Library/Application Support/Steam/steamapps/common/Don't Starve Together/
   Windows: C:\Program Files (x86)\Steam\steamapps\common\Don't Starve Together\

3. 解包资源:
   ./ktech /path/to/anim/spider.zip spider.png

4. 使用图像编辑工具裁剪为 128x128 像素

方法2：下载同人素材
--------------------
1. 访问 https://www.spriters-resource.com/pc_computer/dontstarve/
2. 下载精灵图
3. 裁剪出单个角色

方法3：使用 AI 生成
-------------------
使用 ChatGPT、Midjourney 等工具生成：
Prompt: "A cute spider from Don't Starve Together game, cartoon style, 
         thick black outline, white background, 128x128 pixels"

需要的文件
----------
- spider.png    (蜘蛛)
- catcoon.png   (獾猫)
- chester.png   (切斯特)
- pig.png       (猪人)
- rabbit.png    (兔子)
- bird.png      (鸟)
- beefalo.png   (皮弗娄牛)

规格：128x128 像素，PNG 透明背景
EOF

echo "已创建说明文件: $ASSETS_DIR/INSTRUCTIONS.txt"
echo ""
echo "=========================================="
echo "完成！请查看说明文件获取详细步骤。"
echo "=========================================="
