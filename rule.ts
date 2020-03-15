/**
 * プロパティへの代入時に、指定した条件式が成立しなかった場合、エラーを発生させるプロパティデコレータ
 * 
 * @param predicate 条件式
 * @param errorMessage エラーメッセージ。省略時は条件式が表示される。
 */
export function rule<T = any>(predicate: (value: T) => boolean, errorMessage?: string): PropertyDecorator {
    return (target, propertyKey) => {
        function getErrorMessage(value: T) {
            const className = target.constructor.name;
            const propertyName = propertyKey.toString();
            const valueString = typeof value === 'string' ? `"${value}"` : `${value}`;
            return `(in property of ${className}.${propertyName}) ${errorMessage || predicate}: ${valueString}`;
        }

        let keepValue: T; // プロパティの代わりに実際の値を保持する変数

        // 既存のプロパティの種類(データプロパティ、アクセサプロパティ)により処理を分ける
        let accessor: Partial<PropertyDecorator> & ThisType<any>;
        const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        if (descriptor?.set == null) {
            // データプロパティの場合は、プロパティにゲッターとセッターを定義する
            accessor = {
                set(value: T) {
                    // 条件式が成立しない場合はエラーを発生させる
                    if(!predicate(value)) {
                        throw new Error(getErrorMessage(value));
                    }

                    // セッターに渡された値は、実際に値を保持する変数に代入する
                    keepValue = value;
                },
                get() {
                    return keepValue;
                }
            };
        } else {
            //  既存のプロパティにセッターが存在する場合は、セッターのみ再定義する
            const oldProperty = Object.getOwnPropertyDescriptor(target, propertyKey);
            const oldSetter = oldProperty?.set;
            accessor = {
                set(value: T) {
                    // 条件式が成立しない場合はエラーを発生させる
                    if(!predicate(value)) {
                        throw new Error(getErrorMessage(value));
                    }
                    
                    // 既存のセッターを呼ぶ
                    oldSetter?.apply(this, [value]);
                }
            };
        }

        // アクセッサの設定を行う
        Object.defineProperty(target, propertyKey, {
            configurable: true,
            ...accessor
        });
    };
}
