'use client';

import styles from './page.module.scss';

export function AdminSkeleton() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                <div className={styles.actions}>
                    <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
                    <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
                </div>
            </div>

            <div className={styles.stats}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={styles.statCard}>
                        <div className={`${styles.skeleton} ${styles.skeletonLabel}`}></div>
                        <div className={`${styles.skeleton} ${styles.skeletonNumber}`}></div>
                    </div>
                ))}
            </div>

            <div className={styles.tableContainer}>
                <div className={`${styles.skeleton} ${styles.skeletonTable}`}></div>
            </div>
        </div>
    );
}
export default function Loading() {
    return <AdminSkeleton />;
}
