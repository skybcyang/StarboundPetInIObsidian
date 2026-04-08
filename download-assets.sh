#!/bin/bash

# 饥荒素材下载脚本
# 使用方法: ./download-assets.sh

echo "=========================================="
echo "  饥荒宠物素材下载脚本"
echo "=========================================="
echo ""
echo "此脚本会帮你下载饥荒游戏素材。"
echo "请确保你有合法的使用权限。"
echo ""

ASSETS_DIR="assets/dst"
mkdir -p "$ASSETS_DIR"

echo "素材目录: $ASSETS_DIR"
echo ""

# 素材URL列表（这些是示例URL，需要替换为实际的素材源）
declare -A ASSETS=(
    ["spider.png"]="https://www.pngkey.com/png/detail/183-1833580_dont-starve-spider.png"
    ["catcoon.png"]="https://www.pngkey.com/png/detail/..."
    ["chester.png"]="https://www.pngkey.com/png/detail/..."
    ["pig.png"]="https://www.pngkey.com/png/detail/..."
)

echo "注意: 这个脚本需要手动更新URL才能使用"
echo "建议手动下载素材，放到 $ASSETS_DIR 目录"
echo ""
echo "推荐素材来源:"
echo "  1. PNGkey: https://www.pngkey.com/pngs/dont-starve/"
echo "  2. KindPNG: https://www.kindpng.com/free/dont-starve/"
echo "  3. PNGwing: https://www.pngwing.com/en/search?q=dont+Starve"
echo ""
echo "需要的文件:"
echo "  - spider.png (蜘蛛)"
echo "  - catcoon.png (獾猫)"
echo "  - chester.png (切斯特)"
echo "  - pig.png (猪人)"
echo ""
echo "素材规格:"
echo "  - 尺寸: 128x128 像素"
echo "  - 格式: PNG 透明背景"
echo "  - 风格: 饥荒游戏原版素材"
echo ""

# 可选：如果你有具体的URL，可以取消下面的注释
# for file in "${!ASSETS[@]}"; do
#     url="${ASSETS[$file]}"
#     echo "下载 $file..."
#     curl -L -o "$ASSETS_DIR/$file" "$url" 2>/dev/null
#     if [ $? -eq 0 ]; then
#         echo "  ✓ 成功"
#     else
#         echo "  ✗ 失败"
#     fi
# done

echo "=========================================="
echo "请手动下载素材后放到: $ASSETS_DIR/"
echo "=========================================="
