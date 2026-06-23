const db = require('./models');

async function seedArcade() {
    try {
        await db.ArcadeGame.create({
            title: "Memory Match (จับคู่ความจำ)",
            description: "ฝึกสมองประลองปัญญากับเกมจับคู่สุดคลาสสิค",
            thumbnail_url: "https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?q=80&w=600&auto=format&fit=crop",
            game_url: "/games/memory-match/index.html",
            internal_component: "",
            mode: "solo",
            is_active: true,
            order_index: 1
        });
        console.log("Memory Match game added successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding arcade game:", err);
        process.exit(1);
    }
}

seedArcade();
