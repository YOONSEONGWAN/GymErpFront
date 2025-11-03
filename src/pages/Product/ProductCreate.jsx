// src/pages/Product/ProductCreate.jsx

import { Tab } from 'bootstrap';
import React, { useEffect, useState } from 'react';
import TextField from '../../components/testfolder/TextField';
import TabSwitcher from '../../components/testfolder/TabSwitcher';
import BinaryRadioGroup from '../../components/testfolder/BinaryRadioGroup';

const PRODUCT_OR_SERVICE = [
    { value: 'PRODUCT', label: '실물 상품' },
    { value: 'SERVICE', label: '서비스 상품' },
];

const DEFAULT_VALUES = {
    productType: 'PRODUCT',
    productName: '',
    serviceName: '',
    salePrice: '',
    saleStatus: 'ACTIVE',
    categoryCode: '',
    memo: '',
};



function ProductCreate() {

    const [values, setValues] = useState(DEFAULT_VALUES);

    const isProduct = values.productType === 'PRODUCT';

    const handleTabChange = (nextType) => {
        setValues((prev) => ({ ...prev, productType: nextType }));
        // 탭 전환 시 다른 필드를 초기화하고 싶다면 여기에서 함께 처리
    };

    useEffect(() => {

    }, []);

    const handleChange = (input, maybeValue) => {
        // BinaryRadioGroup처럼 (name, value) 형태로 호출할 때를 지원
        if (typeof input === 'string') {
            const name = input;
            const value = maybeValue;
            setValues(prev => ({ ...prev, [name]: value }));
            return;
        }

        const { name, value } = input.target ?? input; // TextField 등 일반 이벤트 객체 대응
        setValues(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <h1>신규 상품/서비스 추가 폼</h1>
            <form>
                <TabSwitcher
                    tabs={PRODUCT_OR_SERVICE}
                    name="productType"
                    activeValue={values.productType}
                    value={values.productType}
                    onChange={handleTabChange}
                />

                <TextField
                    label={isProduct ? '상품명' : '서비스명'}
                    name={isProduct ? 'productName' : 'serviceName'} // 서비스명을 별도 필드로 저장
                    value={isProduct ? values.productName : values.serviceName}
                    onChange={handleChange}
                    placeholder={isProduct ? '상품명을 입력하세요' : '서비스명을 입력하세요'}
                />

                <TextField
                    label="판매가"
                    name="salePrice"
                    type="number"
                    value={values.salePrice}
                    onChange={handleChange}
                    placeholder='원 단위 숫자만 입력하세요'
                    inputProps={{ min: 0 }}
                />

                <BinaryRadioGroup
                    label="판매 상태"
                    name="saleStatus"
                    value={values.saleStatus}
                    onChange={handleChange}
                    options={[
                        { value: 'ACTIVE', label: '판매중' },
                        { value: 'INACTIVE', label: '판매중지' },
                    ]}
                />

                <TextField
                    label={isProduct ? '상품 설명' : '서비스 설명'}
                    name="memo"
                    value={values.memo}
                    onChange={handleChange}
                    placeholder={isProduct ? '상품에 대한 설명을 입력하세요' : '서비스에 대한 설명을 입력하세요'}
                />


            </form>
        </>
    );
}

export default ProductCreate;
