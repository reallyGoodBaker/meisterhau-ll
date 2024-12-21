import styles from './fonts.module.css'

export default function Icon({ codePoint, fontSize }: any) {
    return <div
        class={styles.i}
        style={`font-size: ${fontSize ?? 'normal'};`}
    >{String.fromCodePoint(parseInt(codePoint, 16))}</div>
}