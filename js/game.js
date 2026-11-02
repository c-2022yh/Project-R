"use strict";

// Fisher–Yates: 1~25를 한 번씩 포함한 배열의 순서만 섞는다.
function createShuffledNumbers(random = Math.random)
{
    const numbers = Array.from({ length: 25 }, (_, index) => index + 1);
    for (let i = numbers.length - 1; i > 0; i--)
    {
        const j = Math.floor(random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
}

class NumberGame
{
    constructor(now = () => performance.now())
    {
        this.now = now;
        this.reset();
    }

    reset()
    {
        this.status = "idle";
        this.numbers = [];
        this.nextNumber = 1;
        this.startedAt = 0;
        this.finishedAt = 0;
    }

    prepare()
    {
        this.reset();
        this.numbers = createShuffledNumbers();
        this.status = "countdown";
    }

    start()
    {
        if (this.status !== "countdown")
        {
            return;
        }
        this.startedAt = this.now();
        this.status = "playing";
    }

    select(number)
    {
        if (this.status !== "playing")
        {
            return "ignored";
        }
        if (number !== this.nextNumber)
        {
            return "wrong";
        }
        this.nextNumber += 1;
        if (number === 25)
        {
            this.finishedAt = this.now();
            this.status = "finished";
            return "finished";
        }
        return "correct";
    }

    get elapsedMs()
    {
        if (this.status === "finished")
        {
            return this.finishedAt - this.startedAt;
        }
        if (this.status === "playing")
        {
            return this.now() - this.startedAt;
        }
        return 0;
    }

    get completedCount()
    {
        return this.nextNumber - 1;
    }
}
