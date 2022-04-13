import enquireJs from 'enquire.js'

export function isDef(v) {
        return v !== undefined && v !== null
}

/**
 * Remove an item from an array.
 */
export function remove(arr, item) {
        if (arr.length) {
                const index = arr.indexOf(item)
                if (index > -1) {
                        return arr.splice(index, 1)
                }
        }
}

export function isRegExp(v) {
        return _toString.call(v) === '[object RegExp]'
}

export function enquireScreen(call) {
        const handler = {
                match: function () {
                        call && call(true)
                },
                unmatch: function () {
                        call && call(false)
                }
        }
        enquireJs.register('only screen and (max-width: 767.99px)', handler)
}

/**
 * 生成树型
 * @param data
 * @param idField
 * @param pidField
 * @param pid
 * @param childName
 * @returns {[]}
 */
export function makeTree(data, idField, pidField = 'parent_id', pid = 0, childName = 'children') {
        var tree = [];
        var temp;
        for (var i = 0; i < data.length; i++) {
                if (data[i][pidField] === pid) {
                        var obj = data[i];
                        temp = makeTree(data, idField, pidField, data[i][idField], childName);
                        if (temp.length > 0) {
                                obj[childName] = temp;
                        }
                        tree.push(obj);
                }
        }
        return tree;
}

/**
 * 删除对象的控制
 * @param objData
 * @returns {{}}
 */
export function delObjEmptyVal(objData) {
        var objReturn = {};
        for (var i in objData) {
                if (objData[i] === '' || objData[i] === undefined) {
                        continue;
                }
                objReturn[i] = objData[i];
        }
        return objReturn;
}

/**
 * 判断是否是合法json字符串
 * @param str
 * @returns {boolean}
 */
export function isJsonStr(str) {
        if (typeof str == 'string') {
                try {
                        var obj = JSON.parse(str);
                        if (typeof obj == 'object' && obj) {
                                return true;
                        } else {
                                return false;
                        }
                } catch (e) {
                        return false;
                }
        }
        return false;
}

/**
 * 格式化时间戳
 * dateFormat(11111111111111, 'Y年m月d日 H时i分')
 * → "2322年02月06日 03时45分"
 * @param timestamp
 * @param formats
 * @returns {string}
 */
export function dateFormat(timestamp, formats) {
        if (!timestamp || timestamp.toString().length <= 5) {
                return '';
        }
        timestamp = timestamp * 1000;
        // formats格式包括
        // 1. Y-m-d
        // 2. Y-m-d H:i:s
        // 3. Y年m月d日
        // 4. Y年m月d日 H时i分
        formats = formats || 'Y-m-d';
        var zero = function (value) {
                if (value < 10) {
                        return '0' + value;
                }
                return value;
        };
        var myDate = timestamp ? new Date(timestamp) : new Date();
        var year = myDate.getFullYear();
        var month = zero(myDate.getMonth() + 1);
        var day = zero(myDate.getDate());
        var hour = zero(myDate.getHours());
        var minute = zero(myDate.getMinutes());
        var second = zero(myDate.getSeconds());
        return formats.replace(/Y|m|d|H|i|s/ig, function (matches) {
                return ({
                        Y: year,
                        m: month,
                        d: day,
                        H: hour,
                        i: minute,
                        s: second
                })[matches];
        });
}

/**
 * 图片转base64
 * @param file
 * @param callback
 */
export function fileToBase64(file, callback) {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(file);
}

/**
 * 数组指定下标值转为下标
 * @param arr
 * @param key
 * @returns {{}}
 */
export function arrayValueToKey(arr, key) {
        var objReturn = {};
        arr.forEach(function (v) {
                objReturn[v[key]] = v;
        });
        return objReturn;
}

const _toString = Object.prototype.toString
