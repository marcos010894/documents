interface ItensCards {
    title: string,
    icon: React.ReactNode,
    Value: string
}

const CardsGlobals = ({ title, icon, Value }: ItensCards) => {
    return (

        <div className="h-[127px] w-[100%] sm:w-[100%] p-4 shadow-sm mb-8" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold">{Value}</h3>
                </div>
                <div>
                    {icon}
                </div>
            </div>
            <div className="mt-5">
                <p className="font-light" style={{fontSize: '11px', lineHeight: '1.1'}}>{title}</p>
            </div>
        </div>
    )
}

export default CardsGlobals


