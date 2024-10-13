import React, { useState } from 'react';
import styles from "./SignUp.module.scss";
export default function SignUp(){
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        userName: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);
    };

    return (
        <div className={styles.signUpBody}>
            <div className={styles.signContainer}>
                <div className={styles.signBox}>
                    <h2>Sign Up</h2>
                    <p>
                    By continuing, you agree to our <a href="#">User Agreement</a> and acknowledge that you understand the <a href="#">Privacy Policy</a>.
                </p>
                    <div className={styles.socialSign}>
                    <button className={styles.socialBtn}>
                        <svg className="custom-icon" xmlns="http://www.w3.org/2000/svg" width="25" height="25"
                             preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" id="google">
                            <path fill="#4285F4"
                                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                            <path fill="#34A853"
                                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                            <path fill="#FBBC05"
                                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path>
                            <path fill="#EB4335"
                                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                        </svg>
                        <span>Continue with Google</span>
                    </button>
                    <button className={styles.socialBtn}>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="25"
                             height="25" viewBox="0 0 190 165" id="outlook">
                            <defs>
                                <filter id="r" width="100.7%" height="101%" x="-.4%" y="-.5%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dx="-1" dy="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.16 0"></feColorMatrix>
                                </filter>
                                <filter id="v" width="101.6%" height="101.2%" x="-.8%" y="-.6%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dx="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1" result="shadowMatrixInner1"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.19 0"></feColorMatrix>
                                    <feOffset dx="1" in="SourceAlpha" result="shadowOffsetInner2"></feOffset>
                                    <feComposite in="shadowOffsetInner2" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner2"></feComposite>
                                    <feColorMatrix in="shadowInnerInner2" result="shadowMatrixInner2"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.17 0"></feColorMatrix>
                                    <feOffset dx="2" dy="1" in="SourceAlpha" result="shadowOffsetInner3"></feOffset>
                                    <feComposite in="shadowOffsetInner3" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner3"></feComposite>
                                    <feColorMatrix in="shadowInnerInner3" result="shadowMatrixInner3"
                                                   values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.01 0"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                                        <feMergeNode in="shadowMatrixInner2"></feMergeNode>
                                        <feMergeNode in="shadowMatrixInner3"></feMergeNode>
                                    </feMerge>
                                </filter>
                                <filter id="A" width="104.8%" height="105.4%" x="-2.4%" y="-2.7%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dx="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1" result="shadowMatrixInner1"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.19 0"></feColorMatrix>
                                    <feOffset dy="2" in="SourceAlpha" result="shadowOffsetInner2"></feOffset>
                                    <feComposite in="shadowOffsetInner2" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner2"></feComposite>
                                    <feColorMatrix in="shadowInnerInner2" result="shadowMatrixInner2"
                                                   values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.08 0"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                                        <feMergeNode in="shadowMatrixInner2"></feMergeNode>
                                    </feMerge>
                                </filter>
                                <filter id="E" width="104.8%" height="105.4%" x="-2.4%" y="-2.7%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dx="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1" result="shadowMatrixInner1"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.19 0"></feColorMatrix>
                                    <feOffset dx="2" dy="1" in="SourceAlpha" result="shadowOffsetInner2"></feOffset>
                                    <feComposite in="shadowOffsetInner2" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner2"></feComposite>
                                    <feColorMatrix in="shadowInnerInner2" result="shadowMatrixInner2"
                                                   values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.01 0"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                                        <feMergeNode in="shadowMatrixInner2"></feMergeNode>
                                    </feMerge>
                                </filter>
                                <filter id="I" width="104.8%" height="105.4%" x="-2.4%" y="-2.7%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dx="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1" result="shadowMatrixInner1"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.19 0"></feColorMatrix>
                                    <feOffset dx="2" dy="1" in="SourceAlpha" result="shadowOffsetInner2"></feOffset>
                                    <feComposite in="shadowOffsetInner2" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner2"></feComposite>
                                    <feColorMatrix in="shadowInnerInner2" result="shadowMatrixInner2"
                                                   values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.01 0"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                                        <feMergeNode in="shadowMatrixInner2"></feMergeNode>
                                    </feMerge>
                                </filter>
                                <filter id="M" width="104.8%" height="105.4%" x="-2.4%" y="-2.7%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dy="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1" result="shadowMatrixInner1"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.19 0"></feColorMatrix>
                                    <feOffset dx="2" dy="1" in="SourceAlpha" result="shadowOffsetInner2"></feOffset>
                                    <feComposite in="shadowOffsetInner2" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner2"></feComposite>
                                    <feColorMatrix in="shadowInnerInner2" result="shadowMatrixInner2"
                                                   values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.01 0"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                                        <feMergeNode in="shadowMatrixInner2"></feMergeNode>
                                    </feMerge>
                                </filter>
                                <filter id="Q" width="102.4%" height="102.7%" x="-1.2%" y="-1.4%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dx="-1" dy="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1" result="shadowMatrixInner1"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.19 0"></feColorMatrix>
                                    <feOffset dy="1" in="SourceAlpha" result="shadowOffsetInner2"></feOffset>
                                    <feComposite in="shadowOffsetInner2" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner2"></feComposite>
                                    <feColorMatrix in="shadowInnerInner2" result="shadowMatrixInner2"
                                                   values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.11 0"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                                        <feMergeNode in="shadowMatrixInner2"></feMergeNode>
                                    </feMerge>
                                </filter>
                                <filter id="U" width="104.8%" height="105.4%" x="-2.4%" y="-2.7%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dx="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1" result="shadowMatrixInner1"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.19 0"></feColorMatrix>
                                    <feGaussianBlur in="SourceAlpha" result="shadowBlurInner2"
                                                    stdDeviation=".5"></feGaussianBlur>
                                    <feOffset dy="1" in="shadowBlurInner2" result="shadowOffsetInner2"></feOffset>
                                    <feComposite in="shadowOffsetInner2" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner2"></feComposite>
                                    <feColorMatrix in="shadowInnerInner2" result="shadowMatrixInner2"
                                                   values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.21 0"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                                        <feMergeNode in="shadowMatrixInner2"></feMergeNode>
                                    </feMerge>
                                </filter>
                                <filter id="Y" width="102.4%" height="102.7%" x="-1.2%" y="-1.4%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dy="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.19 0"></feColorMatrix>
                                </filter>
                                <filter id="ac" width="104.8%" height="105.4%" x="-2.4%" y="-2.7%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dx="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1" result="shadowMatrixInner1"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.19 0"></feColorMatrix>
                                    <feOffset dx="2" dy="1" in="SourceAlpha" result="shadowOffsetInner2"></feOffset>
                                    <feComposite in="shadowOffsetInner2" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner2"></feComposite>
                                    <feColorMatrix in="shadowInnerInner2" result="shadowMatrixInner2"
                                                   values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.01 0"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                                        <feMergeNode in="shadowMatrixInner2"></feMergeNode>
                                    </feMerge>
                                </filter>
                                <filter id="ag" width="104.8%" height="105.4%" x="-2.4%" y="-2.7%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dx="2" dy="1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1"
                                                   values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0"></feColorMatrix>
                                </filter>
                                <filter id="ak" width="118.7%" height="117.6%" x="-9.3%" y="-8.8%"
                                        filterUnits="objectBoundingBox">
                                    <feGaussianBlur in="SourceAlpha" result="shadowBlurInner1"
                                                    stdDeviation="5"></feGaussianBlur>
                                    <feOffset dx="4" dy="-3" in="shadowBlurInner1"
                                              result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1" result="shadowMatrixInner1"
                                                   values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.37 0"></feColorMatrix>
                                    <feOffset dx="-1" dy="-1" in="SourceAlpha" result="shadowOffsetInner2"></feOffset>
                                    <feComposite in="shadowOffsetInner2" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner2"></feComposite>
                                    <feColorMatrix in="shadowInnerInner2" result="shadowMatrixInner2"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.16 0"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                                        <feMergeNode in="shadowMatrixInner2"></feMergeNode>
                                    </feMerge>
                                </filter>
                                <filter id="ao" width="102.9%" height="104.9%" x="-1.4%" y="-2.5%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dx="-4" dy="-1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1" result="shadowMatrixInner1"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.17 0"></feColorMatrix>
                                    <feOffset dx="-1" dy="-1" in="SourceAlpha" result="shadowOffsetInner2"></feOffset>
                                    <feComposite in="shadowOffsetInner2" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner2"></feComposite>
                                    <feColorMatrix in="shadowInnerInner2" result="shadowMatrixInner2"
                                                   values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.16 0"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                                        <feMergeNode in="shadowMatrixInner2"></feMergeNode>
                                    </feMerge>
                                </filter>
                                <filter id="aq" width="117%" height="117%" x="-8.5%" y="-8.5%"
                                        filterUnits="objectBoundingBox">
                                    <feGaussianBlur in="SourceGraphic" stdDeviation="3"></feGaussianBlur>
                                </filter>
                                <filter id="ax" width="103.1%" height="103.1%" x="-1.6%" y="-1.5%"
                                        filterUnits="objectBoundingBox">
                                    <feGaussianBlur in="SourceAlpha" result="shadowBlurInner1"
                                                    stdDeviation=".5"></feGaussianBlur>
                                    <feOffset dx="-1" in="shadowBlurInner1" result="shadowOffsetInner1"></feOffset>
                                    <feComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner1"></feComposite>
                                    <feColorMatrix in="shadowInnerInner1" result="shadowMatrixInner1"
                                                   values="0 0 0 0 0   0 0 0 0 0.466666667   0 0 0 0 0.88627451  0 0 0 1 0"></feColorMatrix>
                                    <feGaussianBlur in="SourceAlpha" result="shadowBlurInner2"
                                                    stdDeviation=".5"></feGaussianBlur>
                                    <feOffset dx="2" in="shadowBlurInner2" result="shadowOffsetInner2"></feOffset>
                                    <feComposite in="shadowOffsetInner2" in2="SourceAlpha" k2="-1" k3="1"
                                                 operator="arithmetic" result="shadowInnerInner2"></feComposite>
                                    <feColorMatrix in="shadowInnerInner2" result="shadowMatrixInner2"
                                                   values="0 0 0 0 0   0 0 0 0 0.4   0 0 0 0 0.737254902  0 0 0 1 0"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                                        <feMergeNode in="shadowMatrixInner2"></feMergeNode>
                                    </feMerge>
                                </filter>
                                <filter id="az" width="139.6%" height="137.5%" x="-19.8%" y="-16.8%"
                                        filterUnits="objectBoundingBox">
                                    <feOffset dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
                                    <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1"
                                                    stdDeviation="3"></feGaussianBlur>
                                    <feColorMatrix in="shadowBlurOuter1" result="shadowMatrixOuter1"
                                                   values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0"></feColorMatrix>
                                    <feOffset dy="1" in="SourceAlpha" result="shadowOffsetOuter2"></feOffset>
                                    <feGaussianBlur in="shadowOffsetOuter2" result="shadowBlurOuter2"
                                                    stdDeviation=".5"></feGaussianBlur>
                                    <feColorMatrix in="shadowBlurOuter2" result="shadowMatrixOuter2"
                                                   values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                                        <feMergeNode in="shadowMatrixOuter2"></feMergeNode>
                                    </feMerge>
                                </filter>
                                <linearGradient id="o" x1="83.848%" y1="17.27%" y2="29.467%">
                                    <stop offset="0%" stop-color="#0052B2"></stop>
                                    <stop offset="100%" stop-color="#0052B2"></stop>
                                </linearGradient>
                                <linearGradient id="t" x1="104.505%" x2="5.953%" y1="2.109%" y2="2.109%">
                                    <stop offset="0%" stop-color="#004CA9"></stop>
                                    <stop offset="100%" stop-color="#003D88"></stop>
                                </linearGradient>
                                <linearGradient id="x" x1="3.848%" x2="103.648%" y1="0%" y2="100%">
                                    <stop offset="3.008%" stop-color="#004DA6"></stop>
                                    <stop offset="100%" stop-color="#005ACB"></stop>
                                </linearGradient>
                                <linearGradient id="B" x1="6.85%" x2="103.648%" y1="3.008%" y2="100%">
                                    <stop offset="0%" stop-color="#05448D"></stop>
                                    <stop offset="97.561%" stop-color="#004BB7"></stop>
                                </linearGradient>
                                <linearGradient id="F" x1="11.155%" x2="100.481%" y1="7.321%" y2="96.827%">
                                    <stop offset="0%" stop-color="#012557"></stop>
                                    <stop offset="100%" stop-color="#0040A7"></stop>
                                </linearGradient>
                                <linearGradient id="J" x1="103.648%" x2="4.908%" y1="100%" y2="1.061%">
                                    <stop offset="0%" stop-color="#009CE9"></stop>
                                    <stop offset="100%" stop-color="#007FC4"></stop>
                                </linearGradient>
                                <linearGradient id="N" x1="3.848%" x2="103.648%" y1="0%" y2="100%">
                                    <stop offset="0%" stop-color="#0057C8"></stop>
                                    <stop offset="100%" stop-color="#0071E8"></stop>
                                </linearGradient>
                                <linearGradient id="R" x1="3.848%" x2="103.648%" y1="0%" y2="100%">
                                    <stop offset="0%" stop-color="#004CB7"></stop>
                                    <stop offset="100%" stop-color="#0062D1"></stop>
                                </linearGradient>
                                <linearGradient id="V" x1="103.648%" x2="3.848%" y1="100%" y2="0%">
                                    <stop offset="0%" stop-color="#00DFFF"></stop>
                                    <stop offset="100%" stop-color="#00B3E8"></stop>
                                </linearGradient>
                                <linearGradient id="Z" x1="103.648%" x2="3.848%" y1="100%" y2="0%">
                                    <stop offset="0%" stop-color="#00C2FF"></stop>
                                    <stop offset="100%" stop-color="#00A1ED"></stop>
                                </linearGradient>
                                <linearGradient id="ad" x1="3.848%" x2="103.648%" y1="0%" y2="100%">
                                    <stop offset="0%" stop-color="#0061CC"></stop>
                                    <stop offset="100%" stop-color="#0173EF"></stop>
                                </linearGradient>
                                <linearGradient id="ah" x1="96.375%" x2="-2.72%" y1="87.174%" y2="39.981%">
                                    <stop offset="0%" stop-color="#00E2FF"></stop>
                                    <stop offset="100%" stop-color="#00B9FF"></stop>
                                    <stop offset="100%" stop-color="#00E3FF"></stop>
                                </linearGradient>
                                <linearGradient id="al" x1="12.047%" y1="39.087%" y2="100%">
                                    <stop offset="0%" stop-color="#009CE6"></stop>
                                    <stop offset="100%" stop-color="#00F3FF"></stop>
                                </linearGradient>
                                <linearGradient id="at" x1="2.151%" x2="113.177%" y1="9.713%" y2="104.673%">
                                    <stop offset="0%" stop-color="#00438D"></stop>
                                    <stop offset="96.954%" stop-color="#0071D5"></stop>
                                </linearGradient>
                                <linearGradient id="aB" x1="29.468%" x2="97.963%" y1="50%" y2="50%">
                                    <stop offset="0%" stop-color="#F0F0F0"></stop>
                                    <stop offset="100%" stop-color="#FFF"></stop>
                                </linearGradient>
                                <pattern id="q" width="512" height="512" x="-511" y="-454"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#a"></use>
                                </pattern>
                                <pattern id="u" width="512" height="512" x="-512" y="-512"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#b"></use>
                                </pattern>
                                <pattern id="z" width="512" height="512" x="-512" y="-499"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#c"></use>
                                </pattern>
                                <pattern id="D" width="512" height="512" x="-512" y="-462"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#d"></use>
                                </pattern>
                                <pattern id="H" width="512" height="512" x="-512" y="-425"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#e"></use>
                                </pattern>
                                <pattern id="L" width="512" height="512" x="-470" y="-499"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#f"></use>
                                </pattern>
                                <pattern id="P" width="512" height="512" x="-470" y="-462"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#g"></use>
                                </pattern>
                                <pattern id="T" width="512" height="512" x="-470" y="-425"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#h"></use>
                                </pattern>
                                <pattern id="X" width="512" height="512" x="-428" y="-499"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#i"></use>
                                </pattern>
                                <pattern id="ab" width="512" height="512" x="-428" y="-462"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#j"></use>
                                </pattern>
                                <pattern id="af" width="512" height="512" x="-428" y="-425"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#k"></use>
                                </pattern>
                                <pattern id="aj" width="512" height="512" x="-443.923" y="-512"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#l"></use>
                                </pattern>
                                <pattern id="an" width="512" height="512" x="-511.2" y="-512"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#m"></use>
                                </pattern>
                                <pattern id="av" width="512" height="512" x="-512" y="-512"
                                         patternUnits="userSpaceOnUse">
                                    <use xlinkHref="#n"></use>
                                </pattern>
                                <rect id="s" width="126" height="165" rx="8"></rect>
                                <rect id="y" width="42" height="37" y="13"></rect>
                                <rect id="C" width="42" height="37" y="50"></rect>
                                <rect id="G" width="42" height="37" y="87"></rect>
                                <rect id="K" width="42" height="37" x="42" y="13"></rect>
                                <rect id="O" width="42" height="37" x="42" y="50"></rect>
                                <rect id="S" width="42" height="37" x="42" y="87"></rect>
                                <rect id="W" width="42" height="37" x="84" y="13"></rect>
                                <rect id="aa" width="42" height="37" x="84" y="50"></rect>
                                <rect id="ae" width="42" height="37" x="84" y="87"></rect>
                                <rect id="as" width="96" height="96" rx="8"></rect>
                                <rect id="ay" width="96" height="98" y="-1" rx="8"></rect>
                                <path id="p"
                                      d="M6.83089478,76.3574944 L72,58 L137.169105,76.3574944 C140.617783,77.3289531 143,80.4749263 143,84.057818 L143,153.45459 L1,153.45459 L1,84.057818 C1,80.4749263 3.38221667,77.3289531 6.83089478,76.3574944 Z"></path>
                                <path id="ai"
                                      d="M139.001618,79.7135614 L68.0768433,38.8391724 C70.5536209,40.2677574 73.6257262,40.1283034 76.100745,38.6966732 L143,-1.42108547e-14 L143,72.9044369 C143,77.3227149 139.071808,79.675766 139.001618,79.7135614 Z"></path>
                                <path id="am"
                                      d="M0.8,-1.687539e-14 L139.001618,79.7135614 C137.780536,80.4686426 136.34116,80.9044369 134.8,80.9044369 L8.8,80.9044369 C4.381722,80.9044369 0.8,77.3227149 0.8,72.9044369 L0.8,-1.42108547e-14 Z"></path>
                                <path id="ap"
                                      d="M8,75.7464789 L8,8 C8,3.581722 11.581722,0 16,0 L126,0 C130.418278,0 134,3.581722 134,8 L134,75.7464789 L136.169105,76.3574944 C139.617783,77.3289531 142,80.4749263 142,84.057818 L142,157 C142,161.418278 138.418278,165 134,165 L8,165 C3.581722,165 8.42798054e-14,161.418278 8.52651283e-14,157 L8.52651283e-14,84.057818 C8.52651283e-14,80.4749263 2.38221667,77.3289531 5.83089478,76.3574944 L8,75.7464789 Z"></path>
                                <path id="aA"
                                      d="M47.7890625,73.6884766 C40.7707982,73.6884766 35.0514544,71.404157 30.6308594,66.8354492 C26.2102644,62.2667415 24,56.3138388 24,48.9765625 C24,41.2291279 26.2444437,34.9629146 30.7333984,30.1777344 C35.2223532,25.3925542 41.1695593,23 48.5751953,23 C55.570673,23 61.2273547,25.2900162 65.5454102,29.8701172 C69.8634656,34.4502182 72.0224609,40.4885693 72.0224609,47.9853516 C72.0224609,55.687213 69.7837138,61.8964608 65.3061523,66.6132812 C60.8285909,71.3301017 54.9896193,73.6884766 47.7890625,73.6884766 Z M48.2882678,31.5019531 C44.1019053,31.5019531 40.7774908,33.0463671 38.3149246,36.1352413 C35.8523584,39.2241154 34.6210938,43.31227 34.6210938,48.3998275 C34.6210938,53.5600644 35.8523584,57.6421624 38.3149246,60.6462439 C40.7774908,63.6503255 44.0034041,65.1523438 47.9927613,65.1523438 C52.1052469,65.1523438 55.3680981,63.6927212 57.781413,60.7734322 C60.1947279,57.8541433 61.4013672,53.8023279 61.4013672,48.6178646 C61.4013672,43.215363 60.2316658,39.0121345 57.8922279,36.0080529 C55.55279,33.0039714 52.351502,31.5019531 48.2882678,31.5019531 Z"></path>
                                <radialGradient id="au" cx="86.601%" cy="84.21%" r="62.398%" fx="86.601%" fy="84.21%">
                                    <stop offset="0%" stop-color="#004F9D"></stop>
                                    <stop offset="100%" stop-color="#004F9D" stop-opacity="0"></stop>
                                </radialGradient>
                            </defs>
                            <g fill="none" fill-rule="evenodd">
                                <g transform="translate(47)">
                                    <use xlinkHref="#p" fill="url(#o)"></use>
                                    <use xlinkHref="#p" fill="url(#q)" fill-opacity=".012"></use>
                                    <use xlinkHref="#p" fill="#000" filter="url(#r)"></use>
                                    <g transform="translate(9)">
                                        <mask id="w" fill="#fff">
                                            <use xlinkHref="#s"></use>
                                        </mask>
                                        <use xlinkHref="#s" fill="url(#t)"></use>
                                        <use xlinkHref="#s" fill="url(#u)" fill-opacity=".012"></use>
                                        <use xlinkHref="#s" fill="#000" filter="url(#v)"></use>
                                        <g mask="url(#w)">
                                            <use xlinkHref="#y" fill="url(#x)"></use>
                                            <use xlinkHref="#y" fill="url(#z)" fill-opacity=".012"></use>
                                            <use xlinkHref="#y" fill="#000" filter="url(#A)"></use>
                                        </g>
                                        <g mask="url(#w)">
                                            <use xlinkHref="#C" fill="url(#B)"></use>
                                            <use xlinkHref="#C" fill="url(#D)" fill-opacity=".012"></use>
                                            <use xlinkHref="#C" fill="#000" filter="url(#E)"></use>
                                        </g>
                                        <g mask="url(#w)">
                                            <use xlinkHref="#G" fill="url(#F)"></use>
                                            <use xlinkHref="#G" fill="url(#H)" fill-opacity=".012"></use>
                                            <use xlinkHref="#G" fill="#000" filter="url(#I)"></use>
                                        </g>
                                        <g mask="url(#w)">
                                            <use xlinkHref="#K" fill="url(#J)"></use>
                                            <use xlinkHref="#K" fill="url(#L)" fill-opacity=".012"></use>
                                            <use xlinkHref="#K" fill="#000" filter="url(#M)"></use>
                                        </g>
                                        <g mask="url(#w)">
                                            <use xlinkHref="#O" fill="url(#N)"></use>
                                            <use xlinkHref="#O" fill="url(#P)" fill-opacity=".012"></use>
                                            <use xlinkHref="#O" fill="#000" filter="url(#Q)"></use>
                                        </g>
                                        <g mask="url(#w)">
                                            <use xlinkHref="#S" fill="url(#R)"></use>
                                            <use xlinkHref="#S" fill="url(#T)" fill-opacity=".012"></use>
                                            <use xlinkHref="#S" fill="#000" filter="url(#U)"></use>
                                        </g>
                                        <g mask="url(#w)">
                                            <use xlinkHref="#W" fill="url(#V)"></use>
                                            <use xlinkHref="#W" fill="url(#X)" fill-opacity=".012"></use>
                                            <use xlinkHref="#W" fill="#000" filter="url(#Y)"></use>
                                        </g>
                                        <g mask="url(#w)">
                                            <use xlinkHref="#aa" fill="url(#Z)"></use>
                                            <use xlinkHref="#aa" fill="url(#ab)" fill-opacity=".012"></use>
                                            <use xlinkHref="#aa" fill="#000" filter="url(#ac)"></use>
                                        </g>
                                        <g mask="url(#w)">
                                            <use xlinkHref="#ae" fill="url(#ad)"></use>
                                            <use xlinkHref="#ae" fill="url(#af)" fill-opacity=".012"></use>
                                            <use xlinkHref="#ae" fill="#000" filter="url(#ag)"></use>
                                        </g>
                                    </g>
                                    <g transform="translate(0 84)">
                                        <use xlinkHref="#ai" fill="url(#ah)"></use>
                                        <use xlinkHref="#ai" fill="url(#aj)" fill-opacity=".012"></use>
                                        <use xlinkHref="#ai" fill="#000" filter="url(#ak)"></use>
                                        <g>
                                            <use xlinkHref="#am" fill="url(#al)"></use>
                                            <use xlinkHref="#am" fill="url(#an)" fill-opacity=".012"></use>
                                            <use xlinkHref="#am" fill="#000" filter="url(#ao)"></use>
                                        </g>
                                    </g>
                                </g>
                                <g transform="translate(48)">
                                    <mask id="ar" fill="#fff">
                                        <use xlinkHref="#ap"></use>
                                    </mask>
                                    <path fill="#000" fill-opacity=".05"
                                          d="M-40,33 L40,33 C44.418278,33 48,36.581722 48,41 L48,121 C48,125.418278 34.418278,139 30,139 L-50,139 C-54.418278,139 -58,135.418278 -58,131 L-58,51 C-58,46.581722 -44.418278,33 -40,33 Z"
                                          filter="url(#aq)" mask="url(#ar)"></path>
                                </g>
                                <g transform="translate(0 34)">
                                    <mask id="aw" fill="#fff">
                                        <use xlinkHref="#as"></use>
                                    </mask>
                                    <use xlinkHref="#as" fill="url(#at)"></use>
                                    <use xlinkHref="#as" fill="url(#au)"></use>
                                    <use xlinkHref="#as" fill="url(#av)" fill-opacity=".013"></use>
                                    <g fill="#000" mask="url(#aw)">
                                        <use xlinkHref="#ay" filter="url(#ax)"></use>
                                    </g>
                                    <g mask="url(#aw)">
                                        <use xlinkHref="#aA" fill="#000" filter="url(#az)"></use>
                                        <use xlinkHref="#aA" fill="url(#aB)"></use>
                                    </g>
                                </g>
                            </g>
                        </svg>
                        <span>Continue with Outlook</span>
                    </button>
                </div>
                    <div className={styles.separator}>OR</div>
                    <form className={styles.signForm} onSubmit={handleSubmit}>
                    <div className={styles.nameContainer}>
                        <div className={styles.formGroup}>
                            <label htmlFor="firstName">First Name<span>*</span></label>
                            <input
                                type="text"
                                id="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                            <small className={styles.error}>Please fill out this field.</small>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="lastName">Last Name<span>*</span></label>
                            <input
                                type="text"
                                id="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                            <small className={styles.error}>Please fill out this field.</small>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email<span>*</span></label>
                        <input
                            type="text"
                            id="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <small className={styles.error}>Please fill out this field.</small>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="userName">Username<span>*</span></label>
                        <input
                            type="text"
                            id="userName"
                            placeholder="Username"
                            value={formData.userName}
                            onChange={handleChange}
                            required
                        />
                        <small className={styles.error}>Please fill out this field.</small>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password<span>*</span></label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <small className={styles.error}>Please fill out this field.</small>
                    </div>
                    <button type="submit" className={styles.signupBtn}>Sign up</button>
                </form>
                    <p>Already a member? <a href="/login">Login</a></p>
                </div>
            </div>
        </div>
    );
};

