"use client";

import React, { useRef, useEffect } from "react";
import anime from "animejs";

interface Point {
    x: number;
    y: number;
    originX: number;
    originY: number;
    closest?: Point[];
    circle?: Circle;
    active?: number;
}

class Circle {
    pos: Point;
    radius: number;
    color: string;
    active: number = 0;

    constructor(pos: Point, rad: number, color: string) {
        this.pos = pos;
        this.radius = rad;
        this.color = color;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = `rgba(59,130,246,${this.active})`; // brand blue
        ctx.fill();
    }
}

export default function NetworkBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const container = containerRef.current;
        let width = container.clientWidth;
        let height = container.clientHeight;
        let targetPos = { x: width / 2, y: height / 2 };
        let target = { x: width / 2, y: height / 2 };
        let animateHeader = true;

        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let points: Point[] = [];

        // create points
        for (let x = 0; x < width; x = x + width / 20) {
            for (let y = 0; y < height; y = y + height / 20) {
                let px = x + Math.random() * width / 20;
                let py = y + Math.random() * height / 20;
                let p: Point = { x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }

        // for each point find the 5 closest points
        for (let i = 0; i < points.length; i++) {
            let closest: Point[] = [];
            let p1 = points[i];
            for (let j = 0; j < points.length; j++) {
                let p2 = points[j];
                if (!(p1 === p2)) {
                    let placed = false;
                    for (let k = 0; k < 5; k++) {
                        if (!placed) {
                            if (closest[k] === undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for (let k = 0; k < 5; k++) {
                        if (!placed) {
                            if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }

        // assign a circle to each point
        for (let i = 0; i < points.length; i++) {
            let c = new Circle(points[i], 2 + Math.random() * 2, "rgba(255,255,255,0.3)");
            points[i].circle = c;
        }

        function getDistance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
            return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
        }

        function mouseMove(e: MouseEvent) {
            let posx = 0;
            let posy = 0;
            if (e.pageX || e.pageY) {
                posx = e.pageX;
                posy = e.pageY;
            } else if (e.clientX || e.clientY) {
                posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            targetPos.x = posx;
            targetPos.y = posy;
        }

        function scrollCheck() {
            if (document.body.scrollTop > height) animateHeader = false;
            else animateHeader = true;
        }

        function resize() {
            if (!containerRef.current) return;
            width = containerRef.current.clientWidth;
            height = containerRef.current.clientHeight;
            canvas.width = width;
            canvas.height = height;
        }

        function drawLines(p: Point) {
            if (!p.active || !p.closest) return;
            for (let i = 0; i < p.closest.length; i++) {
                ctx!.beginPath();
                ctx!.moveTo(p.x, p.y);
                ctx!.lineTo(p.closest[i].x, p.closest[i].y);
                ctx!.strokeStyle = `rgba(59,130,246,${p.active})`; // brand blue
                ctx!.stroke();
            }
        }

        function animate() {
            if (animateHeader) {
                // Smooth interpolation (lerp) towards the target position
                target.x += (targetPos.x - target.x) * 0.05;
                target.y += (targetPos.y - target.y) * 0.05;

                ctx!.clearRect(0, 0, width, height);
                for (let i = 0; i < points.length; i++) {
                    // detect points in range
                    if (Math.abs(getDistance(target, points[i])) < 4000) {
                        points[i].active = 0.5;
                        if(points[i].circle) points[i].circle!.active = 0.8;
                    } else if (Math.abs(getDistance(target, points[i])) < 20000) {
                        points[i].active = 0.3;
                        if(points[i].circle) points[i].circle!.active = 0.5;
                    } else if (Math.abs(getDistance(target, points[i])) < 40000) {
                        points[i].active = 0.1;
                        if(points[i].circle) points[i].circle!.active = 0.2;
                    } else {
                        points[i].active = 0.02; // Always slightly visible for a cool background effect
                        if(points[i].circle) points[i].circle!.active = 0.05;
                    }

                    drawLines(points[i]);
                    if(points[i].circle) points[i].circle!.draw(ctx!);
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        }

        function shiftPoint(p: Point) {
            anime({
                targets: p,
                x: p.originX - 50 + Math.random() * 100,
                y: p.originY - 50 + Math.random() * 100,
                duration: 1000 + Math.random() * 2000,
                easing: 'easeInOutCirc',
                complete: function () {
                    shiftPoint(p);
                }
            });
        }

        function touchMove(e: TouchEvent) {
            if (e.touches.length > 0) {
                let posx = e.touches[0].clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                let posy = e.touches[0].clientY + document.body.scrollTop + document.documentElement.scrollTop;
                targetPos.x = posx;
                targetPos.y = posy;
            }
        }

        let animationFrameId: number;

        // Init Animation
        animate();
        for (let i = 0; i < points.length; i++) {
            shiftPoint(points[i]);
        }

        // Add Listeners
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('touchmove', touchMove, { passive: true });
        window.addEventListener('scroll', scrollCheck, { passive: true });
        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('touchmove', touchMove);
            window.removeEventListener('scroll', scrollCheck);
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
            anime.remove(points);
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden w-full h-full bg-brandDark">
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}
