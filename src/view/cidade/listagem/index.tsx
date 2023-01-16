import { AxiosError } from 'axios';
import api from '../../../services/api';
import { useState, useEffect } from 'react';
import { ApiError, ListagemProps } from '../../../services/tipos';
import { Listagem } from '../../../rxlib/componentes/layout/listagem';
import { ConfiguracoesTabela } from '../../../rxlib/componentes/table';
import { RxlibLayout } from '../../../rxlib/componentes/layout/rxlib-Layout';
import { ModalWarning } from '../../../rxlib/componentes/modal/modal-warning';
import { obterQuantidadeParaPular, tratarErroApi } from '../../../rxlib/services/utilitarios';

import {
    Breadcrumb,
    BreadcrumbItem,
} from 'rxlib-react';

function CidadeListagem(props: ListagemProps) {
    const [cidades, setCidades] = useState<[{}]>([{}]);
    const [carregando, setCarregando] = useState<boolean>(false);
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [quantidadeTotal, setQuantidadeTotal] = useState<number>(0);
    const [messageWarning, setMessageWarning] = useState<string[]>([]);

    const handleHide = () => setShowWarning(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { texto: 'Home', link: '/home' },
        { texto: 'Cidades', link: '' },
    ];

    const configuracoesTabela: ConfiguracoesTabela = {
        mensagemPadrao: 'Não foram encontrados resultados para a consulta.',
        colunas: [
            { nome: 'Nome', campo: 'Nome', tipo: 'string' },
            { nome: 'UF', campo: 'UF', entidadePai: 'Estado', tipo: 'string' }
        ],
    }

    const quantidadeRegistrosPorPagina = 10;
    const quantidadeParaPular = obterQuantidadeParaPular(parseInt(props.match.params.pagina), quantidadeRegistrosPorPagina);

    useEffect(() => {
        setCarregando(true);
        api.get(`/OData/Cidade?$count=true&$top=${quantidadeRegistrosPorPagina}&$expand=Estado&$skip=${quantidadeParaPular}`)
            .then(response => {
                setTimeout(() => {
                    setQuantidadeTotal(response.data['@odata.count']);
                    setCidades(response.data.value);
                    setCarregando(false);
                }, 250);
            }).catch((error: AxiosError<ApiError>) => {
                setCarregando(false);
                setMessageWarning(tratarErroApi(error, 'Não foi possível realizar a consulta: '));
                setShowWarning(true);
            });
    }, [quantidadeParaPular]);

    return (
        <>
            <RxlibLayout>
                <Breadcrumb
                    itens={breadcrumbs} />
                <Listagem
                    campoId='Id'
                    fonteDados={cidades}
                    tipoBotaoAcao='button'
                    listagemDetalhe={false}
                    carregando={carregando}
                    linkListagem='/cidade'
                    linkNovo='/cidade/novo'
                    linkEdicao='/cidade/editar'
                    linkExclusao='/cidade/exclusao'
                    descricao='Listagem de cidades'
                    linkVisualizacao='/cidade/visualizar'
                    configuracoesTabela={configuracoesTabela}
                    quantidadeTotalRegistros={quantidadeTotal}
                    paginaAtual={parseInt(props.match.params.pagina)}
                    quantidadeRegistrosPorPagina={quantidadeRegistrosPorPagina} />
                <ModalWarning
                    show={showWarning}
                    onHide={handleHide}
                    message={messageWarning} />
            </RxlibLayout>
        </>
    );
}

export default CidadeListagem;