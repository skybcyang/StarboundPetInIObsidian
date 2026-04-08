#!/usr/bin/env python3
"""
创建饥荒风格的占位素材图片
适用于已购买正版游戏的用户作为临时素材使用
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 素材目录
ASSETS_DIR = "assets/dst"
os.makedirs(ASSETS_DIR, exist_ok=True)

# 饥荒风格配色
DST_COLORS = {
    'spider': {
        'body': '#3D2817',      # 深棕色身体
        'legs': '#1A0F08',      # 深色腿
        'eyes': '#FF0000',      # 红眼睛
        'outline': '#000000',
        'bg': None              # 透明
    },
    'catcoon': {
        'body': '#8B7355',      # 棕灰色
        'belly': '#D4C4B0',     # 浅色肚子
        'ears': '#A08060',      # 耳朵
        'eyes': '#FFD700',      # 金色眼睛
        'outline': '#000000',
        'bg': None
    },
    'chester': {
        'body': '#8B4513',      # 棕色箱子
        'mouth': '#D2691E',     # 嘴巴
        'tongue': '#FF6347',    # 舌头
        'eyes': '#FFD700',      # 金色眼睛
        'outline': '#000000',
        'bg': None
    },
    'pig': {
        'body': '#F4A460',      # 肉色
        'snout': '#FFB6C1',     # 粉色鼻子
        'ears': '#D2691E',      # 棕色耳朵
        'eyes': '#000000',
        'outline': '#000000',
        'bg': None
    },
    'rabbit': {
        'body': '#F5F5DC',      # 米色
        'ears': '#FFB6C1',      # 粉色耳朵
        'eyes': '#000000',
        'outline': '#000000',
        'bg': None
    },
    'bird': {
        'body': '#4169E1',      # 蓝色
        'belly': '#87CEEB',     # 浅蓝肚子
        'beak': '#FFD700',      # 黄色嘴巴
        'eyes': '#000000',
        'outline': '#000000',
        'bg': None
    },
    'beefalo': {
        'body': '#808080',      # 灰色
        'fur': '#A9A9A9',       # 浅灰毛发
        'horns': '#F5F5DC',     # 白色角
        'eyes': '#000000',
        'outline': '#000000',
        'bg': None
    }
}

def create_spider():
    """创建蜘蛛图片"""
    img = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    colors = DST_COLORS['spider']
    
    # 绘制身体（椭圆）
    draw.ellipse([44, 44, 84, 84], fill=colors['body'], outline=colors['outline'], width=3)
    
    # 绘制腿（8条）
    leg_color = colors['legs']
    # 左上腿
    draw.line([44, 54, 24, 34], fill=leg_color, width=4)
    draw.line([24, 34, 14, 24], fill=leg_color, width=3)
    # 右上腿
    draw.line([84, 54, 104, 34], fill=leg_color, width=4)
    draw.line([104, 34, 114, 24], fill=leg_color, width=3)
    # 左中腿
    draw.line([42, 64, 20, 64], fill=leg_color, width=4)
    draw.line([20, 64, 10, 64], fill=leg_color, width=3)
    # 右中腿
    draw.line([86, 64, 108, 64], fill=leg_color, width=4)
    draw.line([108, 64, 118, 64], fill=leg_color, width=3)
    # 左下腿
    draw.line([44, 74, 24, 94], fill=leg_color, width=4)
    draw.line([24, 94, 14, 104], fill=leg_color, width=3)
    # 右下腿
    draw.line([84, 74, 104, 94], fill=leg_color, width=4)
    draw.line([104, 94, 114, 104], fill=leg_color, width=3)
    
    # 绘制眼睛（红色发光效果）
    draw.ellipse([52, 52, 60, 60], fill=colors['eyes'])
    draw.ellipse([68, 52, 76, 60], fill=colors['eyes'])
    # 眼睛高光
    draw.ellipse([54, 54, 57, 57], fill='#FFFFFF')
    draw.ellipse([70, 54, 73, 57], fill='#FFFFFF')
    
    # 獠牙
    draw.polygon([58, 75, 62, 85, 66, 75], fill='#FFFFFF', outline='#000000')
    
    return img

def create_catcoon():
    """创建獾猫图片"""
    img = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    colors = DST_COLORS['catcoon']
    
    # 尾巴（蓬松）
    draw.ellipse([20, 60, 45, 100], fill=colors['body'], outline=colors['outline'], width=3)
    draw.ellipse([15, 50, 40, 80], fill=colors['body'], outline=colors['outline'], width=3)
    
    # 身体
    draw.ellipse([40, 55, 95, 105], fill=colors['body'], outline=colors['outline'], width=3)
    # 肚子
    draw.ellipse([50, 70, 85, 95], fill=colors['belly'], outline=colors['outline'], width=2)
    
    # 头
    draw.ellipse([45, 25, 90, 70], fill=colors['body'], outline=colors['outline'], width=3)
    
    # 耳朵（三角形）
    draw.polygon([48, 35, 42, 15, 58, 28], fill=colors['ears'], outline=colors['outline'], width=2)
    draw.polygon([87, 35, 93, 15, 77, 28], fill=colors['ears'], outline=colors['outline'], width=2)
    
    # 眼睛
    draw.ellipse([55, 40, 65, 50], fill=colors['eyes'], outline=colors['outline'], width=2)
    draw.ellipse([70, 40, 80, 50], fill=colors['eyes'], outline=colors['outline'], width=2)
    draw.ellipse([58, 42, 62, 46], fill='#000000')
    draw.ellipse([73, 42, 77, 46], fill='#000000')
    
    # 鼻子
    draw.ellipse([62, 52, 73, 58], fill='#FF69B4', outline=colors['outline'], width=1)
    
    # 条纹
    draw.line([50, 30, 55, 35], fill='#000000', width=2)
    draw.line([85, 30, 80, 35], fill='#000000', width=2)
    
    return img

def create_chester():
    """创建切斯特图片"""
    img = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    colors = DST_COLORS['chester']
    
    # 主体（圆角矩形）
    draw.rounded_rectangle([30, 40, 98, 108], radius=10, fill=colors['body'], outline=colors['outline'], width=4)
    
    # 盖子
    draw.rounded_rectangle([25, 30, 103, 50], radius=5, fill='#A0522D', outline=colors['outline'], width=3)
    
    # 舌头（伸出）
    draw.ellipse([55, 95, 73, 115], fill=colors['tongue'], outline=colors['outline'], width=2)
    
    # 嘴巴
    draw.arc([45, 75, 83, 95], start=0, end=180, fill=colors['mouth'], width=3)
    
    # 眼睛（金色）
    draw.ellipse([42, 55, 52, 70], fill=colors['eyes'], outline=colors['outline'], width=2)
    draw.ellipse([76, 55, 86, 70], fill=colors['eyes'], outline=colors['outline'], width=2)
    draw.ellipse([45, 58, 49, 65], fill='#000000')
    draw.ellipse([79, 58, 83, 65], fill='#000000')
    
    # 腿
    for x in [35, 55, 75, 93]:
        draw.rounded_rectangle([x, 105, x+8, 118], radius=2, fill='#654321', outline=colors['outline'], width=2)
    
    return img

def create_pig():
    """创建猪人图片"""
    img = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    colors = DST_COLORS['pig']
    
    # 身体
    draw.ellipse([35, 50, 93, 108], fill=colors['body'], outline=colors['outline'], width=3)
    
    # 头
    draw.ellipse([38, 20, 90, 72], fill=colors['body'], outline=colors['outline'], width=3)
    
    # 猪鼻子（椭圆形）
    draw.ellipse([52, 45, 76, 60], fill=colors['snout'], outline=colors['outline'], width=2)
    # 鼻孔
    draw.ellipse([58, 50, 62, 55], fill='#000000')
    draw.ellipse([66, 50, 70, 55], fill='#000000')
    
    # 耳朵
    draw.polygon([42, 28, 35, 15, 50, 22], fill=colors['ears'], outline=colors['outline'], width=2)
    draw.polygon([86, 28, 93, 15, 78, 22], fill=colors['ears'], outline=colors['outline'], width=2)
    
    # 眼睛
    draw.ellipse([48, 32, 56, 40], fill='#FFFFFF', outline=colors['outline'], width=1)
    draw.ellipse([72, 32, 80, 40], fill='#FFFFFF', outline=colors['outline'], width=1)
    draw.ellipse([51, 34, 54, 38], fill='#000000')
    draw.ellipse([75, 34, 78, 38], fill='#000000')
    
    # 腿
    draw.rounded_rectangle([45, 100, 55, 118], radius=3, fill=colors['body'], outline=colors['outline'], width=2)
    draw.rounded_rectangle([73, 100, 83, 118], radius=3, fill=colors['body'], outline=colors['outline'], width=2)
    
    return img

def create_rabbit():
    """创建兔子图片"""
    img = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    colors = DST_COLORS['rabbit']
    
    # 身体
    draw.ellipse([45, 60, 85, 100], fill=colors['body'], outline=colors['outline'], width=3)
    
    # 头
    draw.ellipse([48, 40, 82, 75], fill=colors['body'], outline=colors['outline'], width=3)
    
    # 长耳朵
    draw.ellipse([50, 15, 60, 50], fill=colors['ears'], outline=colors['outline'], width=2)
    draw.ellipse([70, 15, 80, 50], fill=colors['ears'], outline=colors['outline'], width=2)
    # 耳朵内部
    draw.ellipse([53, 20, 57, 40], fill='#FFC0CB')
    draw.ellipse([73, 20, 77, 40], fill='#FFC0CB')
    
    # 眼睛
    draw.ellipse([55, 50, 60, 55], fill=colors['eyes'])
    draw.ellipse([70, 50, 75, 55], fill=colors['eyes'])
    
    # 鼻子
    draw.ellipse([62, 58, 68, 63], fill='#FF69B4')
    
    # 尾巴
    draw.ellipse([78, 80, 90, 92], fill='#FFFFFF', outline=colors['outline'], width=2)
    
    return img

def create_bird():
    """创建鸟图片"""
    img = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    colors = DST_COLORS['bird']
    
    # 身体
    draw.ellipse([40, 50, 90, 95], fill=colors['body'], outline=colors['outline'], width=3)
    
    # 肚子（浅色）
    draw.ellipse([50, 70, 80, 92], fill=colors['belly'], outline=colors['outline'], width=2)
    
    # 头
    draw.ellipse([55, 30, 85, 60], fill=colors['body'], outline=colors['outline'], width=3)
    
    # 嘴巴
    draw.polygon([82, 40, 100, 45, 82, 50], fill=colors['beak'], outline=colors['outline'], width=2)
    
    # 眼睛
    draw.ellipse([65, 38, 72, 45], fill='#FFFFFF', outline=colors['outline'], width=1)
    draw.ellipse([67, 40, 70, 43], fill='#000000')
    
    # 翅膀
    draw.ellipse([35, 55, 50, 80], fill='#1E90FF', outline=colors['outline'], width=2)
    
    # 腿
    draw.line([60, 93, 60, 108], fill='#FF8C00', width=3)
    draw.line([70, 93, 70, 108], fill='#FF8C00', width=3)
    
    return img

def create_beefalo():
    """创建皮弗娄牛图片"""
    img = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    colors = DST_COLORS['beefalo']
    
    # 身体（大）
    draw.ellipse([25, 45, 105, 105], fill=colors['body'], outline=colors['outline'], width=3)
    
    # 毛发纹理
    for i in range(30, 100, 15):
        draw.arc([i, 45, i+20, 65], start=0, end=180, fill='#696969', width=2)
    
    # 头
    draw.ellipse([35, 25, 75, 65], fill=colors['body'], outline=colors['outline'], width=3)
    
    # 角
    draw.polygon([32, 30, 25, 10, 40, 25], fill=colors['horns'], outline=colors['outline'], width=2)
    draw.polygon([78, 30, 85, 10, 70, 25], fill=colors['horns'], outline=colors['outline'], width=2)
    
    # 鼻子
    draw.ellipse([48, 48, 62, 58], fill='#2F4F4F', outline=colors['outline'], width=2)
    
    # 眼睛
    draw.ellipse([42, 38, 48, 44], fill='#000000')
    draw.ellipse([62, 38, 68, 44], fill='#000000')
    
    # 腿
    for x in [35, 50, 75, 90]:
        draw.rounded_rectangle([x, 95, x+10, 118], radius=3, fill='#696969', outline=colors['outline'], width=2)
    
    return img

def main():
    """主函数：创建所有素材"""
    print("🎮 创建饥荒风格宠物素材...")
    print()
    
    assets = {
        'spider.png': create_spider,
        'catcoon.png': create_catcoon,
        'chester.png': create_chester,
        'pig.png': create_pig,
        'rabbit.png': create_rabbit,
        'bird.png': create_bird,
        'beefalo.png': create_beefalo
    }
    
    for filename, create_func in assets.items():
        filepath = os.path.join(ASSETS_DIR, filename)
        try:
            img = create_func()
            img.save(filepath, 'PNG')
            print(f"✅ 已创建: {filename}")
        except Exception as e:
            print(f"❌ 失败: {filename} - {e}")
    
    print()
    print(f"📁 素材已保存到: {ASSETS_DIR}/")
    print()
    print("💡 提示：这些是临时占位素材")
    print("   你可以从游戏文件或网上找到更好的素材替换它们")
    print()
    print("替换方法：")
    print("  1. 找到更好的素材图片（128x128 PNG 透明背景）")
    print("  2. 重命名为对应的文件名")
    print("  3. 替换到 assets/dst/ 目录")
    print("  4. 重启 Obsidian 插件")

if __name__ == '__main__':
    main()
