from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, not_, exists, and_, func, distinct
from app.database import get_db
from app.models.project import Project
from app.models.assessment import Assessment
from app.models.evaluator import Evaluator
from app.models.response import Response
from app.models.question import Question
from app.schemas.cards import CardsResponse, ProjectCard

router = APIRouter()

@router.get("", response_model=CardsResponse)
@router.get("/", response_model=CardsResponse)
async def get_cards_data(db: Session = Depends(get_db)):
    try:
        total_projetos = db.query(Project).filter(Project.deleted_at == None).count()
        
        projetos_sem_avaliacao = db.query(Project).filter(
            Project.deleted_at == None,
            ~exists().where(
                and_(
                    Assessment.project_id == Project.id,
                    Assessment.deleted_at == None,
                    exists().where(
                        and_(
                            Response.assessment_id == Assessment.id,
                            Response.deleted_at == None
                        )
                    )
                )
            )
        ).count()
        
        projetos_avaliados = total_projetos - projetos_sem_avaliacao
        
        avaliadores_ativos = db.query(Evaluator).filter(Evaluator.deleted_at == None).count()
        
        faltam_1_avaliacao = (
            db.query(Project)
            .join(Assessment, and_(
                Assessment.project_id == Project.id,
                Assessment.deleted_at == None
            ))
            .join(Response, and_(
                Response.assessment_id == Assessment.id,
                Response.deleted_at == None
            ))
            .filter(Project.deleted_at == None)
            .group_by(Project.id)
            .having(func.count(distinct(Assessment.id)) == 2)
            .count()
        )

        faltam_2_avaliacoes = (
            db.query(Project)
            .join(Assessment, and_(
                Assessment.project_id == Project.id,
                Assessment.deleted_at == None
            ))
            .join(Response, and_(
                Response.assessment_id == Assessment.id,
                Response.deleted_at == None
            ))
            .filter(Project.deleted_at == None)
            .group_by(Project.id)
            .having(func.count(distinct(Assessment.id)) == 1)
            .count()
        )

        faltam_3_avaliacoes = projetos_sem_avaliacao
        
        progresso_geral = 0
        progresso_geral_inicial = 0
        if total_projetos > 0:
            progresso_geral_inicial = round((projetos_avaliados / total_projetos) * 100)
            soma_projetos_nao_finalizados = faltam_1_avaliacao + faltam_2_avaliacoes + faltam_3_avaliacoes
            progresso_geral = round(((total_projetos - soma_projetos_nao_finalizados) / total_projetos) * 100)

        projetos = db.query(Project).filter(Project.deleted_at == None).all()
        projects_list = []
        
        for projeto in projetos:
            assessments = db.query(Assessment).filter(
                Assessment.project_id == projeto.id,
                Assessment.deleted_at == None
            ).all()
            
            if not assessments:
                projects_list.append(ProjectCard(nome=projeto.title, nota_final=0.0))
                continue
            
            total_peso_score = 0.0
            total_peso = 0.0
            
            for assessment in assessments:
                responses = db.query(Response).join(Question).filter(
                    Response.assessment_id == assessment.id,
                    Response.deleted_at == None,
                    Response.score != None,
                    Question.deleted_at == None
                ).all()
                
                for response in responses:
                    peso = response.question.number_alternatives or 1
                    total_peso_score += (response.score * peso)
                    total_peso += peso
            
            nota_final = round(total_peso_score / total_peso, 2) if total_peso > 0 else 0.0
            projects_list.append(ProjectCard(nome=projeto.title, nota_final=nota_final))

        projects_list.sort(key=lambda x: x.nota_final, reverse=True)

        return CardsResponse(
            total_projetos=total_projetos,
            trabalhos_para_avaliar=projetos_sem_avaliacao,
            trabalhos_avaliados=projetos_avaliados,
            avaliadores_ativos=avaliadores_ativos,
            progresso_geral=progresso_geral,
            progresso_geral_inicial=progresso_geral_inicial,
            status_avaliacoes={
                "faltam_1_avaliacao": faltam_1_avaliacao,
                "faltam_2_avaliacoes": faltam_2_avaliacoes,
                "faltam_3_avaliacoes": faltam_3_avaliacoes
            },
            projects=projects_list
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar dados dos cards: {str(e)}"
        ) 