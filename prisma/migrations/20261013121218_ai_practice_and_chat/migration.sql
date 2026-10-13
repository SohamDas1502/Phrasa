-- CreateTable
CREATE TABLE "PracticeSentence" (
    "id" TEXT NOT NULL,
    "zh" TEXT NOT NULL,
    "tokens" TEXT[],
    "punct" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "en" TEXT NOT NULL,
    "chars" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeSentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyUsage" (
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyUsage_pkey" PRIMARY KEY ("userId","day","kind")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeSentence_zh_key" ON "PracticeSentence"("zh");

-- CreateIndex
CREATE INDEX "PracticeSentence_chars_idx" ON "PracticeSentence" USING GIN ("chars");

-- AddForeignKey
ALTER TABLE "DailyUsage" ADD CONSTRAINT "DailyUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
